const QRCode = require('qrcode');
const { db } = require('../config/db');

// Gera o QR, salva no banco e retorna a imagem para o front
exports.gerarEGravar = async (req, res) => {
    const { label, target_url } = req.body;

    if (!label || !target_url) {
        return res.status(400).json({ success: false, message: "Dados incompletos." });
    }

    try {
        // Gera o QR Code com as cores da RM Technologies
        const qrImageBase64 = await QRCode.toDataURL(target_url, {
            color: {
                dark: '#004a99', // Azul escuro da marca
                light: '#ffffff'
            },
            width: 400,
            margin: 2
        });

        const sql = "INSERT INTO generated_qrcodes (label, target_url, qr_image_base64) VALUES (?, ?, ?)";
        db.run(sql, [label, target_url, qrImageBase64], function(err) {
            if (err) {
                console.error("Erro ao salvar QR:", err);
                return res.status(500).json({ success: false });
            }
            res.json({ success: true, id: this.lastID, qrImage: qrImageBase64 });
        });
    } catch (err) {
        console.error("Erro ao gerar QR:", err);
        res.status(500).json({ success: false });
    }
};

// Lista o histórico de lotes gerados
exports.listarHistorico = (req, res) => {
    const sql = "SELECT id, label, target_url, created_at FROM generated_qrcodes ORDER BY id DESC";
    db.all(sql, (err, rows) => {
        if (err) return res.status(500).json({ success: false });
        res.json({ success: true, qrcodes: rows });
    });
};

// Recupera a imagem salva para reimpressão
exports.obterImagem = (req, res) => {
    const sql = "SELECT qr_image_base64 FROM generated_qrcodes WHERE id = ?";
    db.get(sql, [req.params.id], (err, row) => {
        if (err || !row) return res.status(404).json({ success: false });
        res.json({ success: true, image: row.qr_image_base64 });
    });
};