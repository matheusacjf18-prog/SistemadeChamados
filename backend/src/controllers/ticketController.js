const { db, resend, registrarLog } = require('../config/db');

exports.enviarChamado = (req, res) => {
    const { user, subject, description } = req.body;
    const sql = 'INSERT INTO tickets (author_username, subject, description) VALUES (?, ?, ?)';
    
    db.run(sql, [user, subject, description], async function(err) {
        if (err) return res.status(500).json({ success: false });
        
        const insertId = this.lastID;
        try {
            await resend.emails.send({
                from: 'Portal RM <suporte@rmtechnologies.com.br>',
                to: 'contato@rmtechnologies.com.br',
                subject: `Novo Chamado #${insertId}: ${subject}`,
                html: `<p><strong>Usuário:</strong> ${user}</p><p><strong>Assunto:</strong> ${subject}</p><p>${description}</p>`
            });
        } catch (e) { 
            console.log("Erro e-mail, mas ticket salvo no banco."); 
        }
        res.json({ success: true });
    });
};

exports.listarChamadosCliente = (req, res) => {
    db.all('SELECT * FROM tickets WHERE author_username = ? ORDER BY id DESC', [req.query.user], (err, rows) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, chamados: rows });
    });
};

exports.listarTodosChamados = (req, res) => {
    const sql = 'SELECT t.*, u.full_name as author_name FROM tickets t JOIN users u ON t.author_username = u.username ORDER BY t.id DESC';
    db.all(sql, (err, rows) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, chamados: rows });
    });
};

exports.atualizarStatus = (req, res) => {
    const { id, status, admin_executor } = req.body;
    db.run('UPDATE tickets SET status = ? WHERE id = ?', [status, id], function(err) {
        if (err) return res.status(500).json({ success: false });
        
        registrarLog(admin_executor, 'STATUS', `Alterou o chamado #${id} para: ${status}`);
        res.json({ success: true });
    });
};