const { db } = require('../config/db');

exports.getMeusAtivos = (req, res) => {
    // Pegamos o ID do usuário que vem do token/sessão
    const userId = req.params.userId; 

    const sql = `
        SELECT equipamento, data_entrega, meses_garantia,
        date(data_entrega, '+' || meses_garantia || ' months') as data_expiracao,
        CAST(julianday(date(data_entrega, '+' || meses_garantia || ' months')) - julianday('now') AS INTEGER) as dias_restantes
        FROM assets_garantia 
        WHERE user_id = ?
    `;

    db.all(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, ativos: rows });
    });
};