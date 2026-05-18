const { db, registrarLog } = require('../config/db.js');

exports.login = (req, res) => {
    const { login, senha } = req.body;
    const sql = `
        SELECT u.id, u.full_name, GROUP_CONCAT(g.group_name) AS group_names
        FROM users u
        LEFT JOIN user_groups ug ON u.id = ug.user_id
        LEFT JOIN \`groups\` g ON ug.group_id = g.id
        WHERE u.username = ? AND u.password = ?
        GROUP BY u.id
    `;
    db.get(sql, [login, senha], (err, user) => {
        if (err) return res.status(500).json({ success: false });
        if (user) {
            registrarLog(login, 'LOGIN', `O usuário acessou o sistema.`);
            return res.json({ 
                success: true, 
                full_name: user.full_name,
                login: login,
                groups: user.group_names ? user.group_names.split(',') : []
            });
        }
        res.json({ success: false });
    });
};

exports.solicitarCodigo = (req, res) => {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    db.run('UPDATE users SET recovery_code = ?, recovery_expires = datetime("now", "+10 minutes") WHERE email = ?', [code, email], async function(err) {
        if (err || this.changes === 0) return res.json({ success: false, message: 'E-mail não cadastrado.' });
        
        try {
            const { resend } = require('../config/db.js');
            await resend.emails.send({
                from: 'Portal RM <suporte@rmtechnologies.com.br>',
                to: email,
                subject: 'Código de Recuperação',
                html: `<h1>${code}</h1>`
            });
            res.json({ success: true });
        } catch (e) { 
            console.error("Erro Resend:", e);
            res.status(500).json({ success: false }); 
        }
    });
};

exports.validarCodigo = (req, res) => {
    db.get('SELECT id FROM users WHERE email=? AND recovery_code=? AND recovery_expires > datetime("now")', [req.body.email, req.body.code], (err, row) => {
        res.json({ success: !!row });
    });
};

exports.resetarSenha = (req, res) => {
    db.run('UPDATE users SET password=?, recovery_code=NULL, recovery_expires=NULL WHERE email=?', [req.body.newPass, req.body.email], function(err) {
        res.json({ success: !err });
    });
};