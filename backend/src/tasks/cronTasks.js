const cron = require('node-cron');
const { db, resend } = require('../config/db');

const enviarRelatorioSemanal = () => {
    const sqlAdmins = `
        SELECT u.email 
        FROM users u 
        JOIN user_groups ug ON u.id = ug.user_id 
        JOIN \`groups\` g ON ug.group_id = g.id 
        WHERE g.group_name = 'master_admin'
    `;

    db.query(sqlAdmins, (err, admins) => {
        if (err || admins.length === 0) return;

        const listaEmails = admins.map(a => a.email);
        const sqlLogs = `
            SELECT data_hora, usuario_executor, acao, detalhes 
            FROM system_logs 
            WHERE data_hora >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
            ORDER BY data_hora DESC
        `;

        db.query(sqlLogs, async (err, logs) => {
            if (err) return;

            let corpoEmail = logs.length === 0 
                ? `<h2>Relatório Semanal</h2><p>Nenhuma atividade registrada.</p>`
                : `<h2>Relatório Semanal de Atividades - Rangel Corp</h2><table border="1">...</table>`;

            try {
                await resend.emails.send({
                    from: 'Sistema RM <suporte@rmtechnologies.com.br>',
                    to: listaEmails,
                    subject: `Relatório Semanal de Auditoria`,
                    html: corpoEmail
                });
            } catch (e) { console.error("Falha no cron:", e); }
        });
    });
};

cron.schedule('0 18 * * 5', () => {
    enviarRelatorioSemanal();
});