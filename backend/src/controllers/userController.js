const { db, registrarLog } = require('../config/db');

exports.obterPerfil = (req, res) => {
    const { username } = req.params;
    const sql = "SELECT full_name, email, telephone, username FROM users WHERE username = ?";
    db.get(sql, [username], (err, row) => {
        if (err) {
            console.error("Erro ao buscar perfil:", err);
            return res.status(500).json({ success: false, message: "Erro interno no servidor." });
        }
        
        if (row) {
            res.json({ success: true, user: row });
        } else {
            res.status(404).json({ success: false, message: "Usuário não encontrado." });
        }
    });
};

exports.atualizarPerfil = (req, res) => {
    const { login, nome, email, telephone, novaSenha } = req.body;
    
    if (!login) {
        return res.status(400).json({ success: false, message: "Identificação inválida." });
    }

    let sql, params;

    if (novaSenha && novaSenha.trim() !== "") {
        sql = `UPDATE users SET full_name = ?, email = ?, telephone = ?, password = ?, password_changed_at = datetime('now') WHERE username = ?`;
        params = [nome, email, telephone, novaSenha, login];
    } else {
        sql = `UPDATE users SET full_name = ?, email = ?, telephone = ? WHERE username = ?`;
        params = [nome, email, telephone, login];
    }

    db.run(sql, params, function(err) {
        if (err) {
            console.error("Erro ao atualizar perfil:", err);
            return res.status(500).json({ success: false });
        }

        if (this.changes === 0) {
            return res.status(404).json({ success: false, message: "Usuário não encontrado ou nenhuma alteração feita." });
        }
        res.json({ success: true });
    });
};

exports.listarUsuariosAdmin = (req, res) => {
    const sql = `SELECT u.id AS userId, u.full_name AS fullName, u.username AS userName, u.email AS userEmail, GROUP_CONCAT(g.group_name) AS userGroups
                 FROM users u LEFT JOIN user_groups ug ON u.id = ug.user_id LEFT JOIN \`groups\` g ON ug.group_id = g.id
                 GROUP BY u.id ORDER BY u.full_name ASC`;
    db.all(sql, (err, rows) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, usuarios: rows });
    });
};

// ESSA É A FUNÇÃO QUE PROVAVELMENTE ESTAVA FALTANDO OU COM NOME ERRADO
exports.criarUsuarioAdmin = (req, res) => {
    const { fullname, username, email, password, groups, admin_executor } = req.body;
    const sqlUser = 'INSERT INTO users (full_name, username, email, password) VALUES (?, ?, ?, ?)';
    db.run(sqlUser, [fullname, username, email, password], function(err) {
        if (err) return res.status(500).json({ success: false, message: 'Login ou E-mail já existe.' });
        const userId = this.lastID;
        registrarLog(admin_executor, 'CRIACAO', `Criou o usuário ${username}`);
        if (!groups || groups.length === 0) return res.json({ success: true });
        const sqlInsert = "INSERT INTO user_groups (user_id, group_id) SELECT ?, id FROM `groups` WHERE group_name = ?";
        let count = 0;
        groups.forEach(gName => {
            db.run(sqlInsert, [userId, gName], function() {
                count++;
                if (count === groups.length) res.json({ success: true });
            });
        });
    });
};

exports.editarUsuarioAdmin = (req, res) => {
    const { id, fullname, email, groups, admin_logado } = req.body;
    db.run('DELETE FROM user_groups WHERE user_id = ?', [id], function(errD) {
        db.run('UPDATE users SET full_name = ?, email = ? WHERE id = ?', [fullname, email, id], function(errU) {
            registrarLog(admin_logado, 'EDICAO', `Editou o usuário ID ${id}`);
            if (!groups || groups.length === 0) return res.json({ success: true });
            const sqlInsert = "INSERT INTO user_groups (user_id, group_id) SELECT ?, id FROM `groups` WHERE group_name = ?";
            let completed = 0;
            groups.forEach(gName => {
                db.run(sqlInsert, [id, gName], function() {
                    completed++;
                    if (completed === groups.length) res.json({ success: true });
                });
            });
        });
    });
};

exports.excluirUsuario = (req, res) => {
    const { id, admin_logado } = req.params;
    db.run('DELETE FROM user_groups WHERE user_id = ?', [id], function() {
        db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
            if (err) return res.status(500).json({ success: false });
            registrarLog(admin_logado, 'EXCLUSAO', `Excluiu o usuário de ID ${id}`);
            res.json({ success: true });
        });
    });
};

exports.listarLogs = (req, res) => {
    const { admin_logado } = req.params;
    db.all('SELECT * FROM system_logs ORDER BY data_hora DESC LIMIT 100', (err, rows) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, logs: rows });
    });
};