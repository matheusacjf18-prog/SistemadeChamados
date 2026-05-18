const sqlite3 = require('sqlite3').verbose();
const { Resend } = require('resend');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

// Caminhos configurados
const dbPath = path.resolve(__dirname, '../../db/database.sqlite');
const sqlSeedPath = path.resolve(__dirname, '../../db/database.sql'); 

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("❌ Erro ao conectar no SQLite:", err);
    } else {
        console.log("✅ Conectado ao banco SQLite");
        db.run('PRAGMA foreign_keys = ON'); // Ativa chaves estrangeiras
        verificarEInicializarBanco();
    }
});

// Função para criar as tabelas automaticamente se o banco estiver vazio
function verificarEInicializarBanco() {
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
        if (err) {
            console.error("Erro ao verificar tabelas:", err);
            return;
        }

        // Se não encontrar a tabela 'users', significa que o banco está vazio
        if (!row) {
            console.log("⚠️ Tabelas não encontradas. Inicializando banco de dados...");
            
            if (fs.existsSync(sqlSeedPath)) {
                const sqlScript = fs.readFileSync(sqlSeedPath, 'utf8');
                
                // .exec roda o arquivo .sql inteiro de uma vez
                db.exec(sqlScript, (execErr) => {
                    if (execErr) console.error("❌ Erro ao criar tabelas:", execErr.message);
                    else console.log("🚀 Banco de dados inicializado com sucesso!");
                });
            } else {
                console.error("❌ Arquivo database.sql não encontrado em:", sqlSeedPath);
            }
        }
    });
}

const resend = new Resend(process.env.RESEND_API_KEY);

const registrarLog = (executor, acao, detalhes) => {
    const sql = 'INSERT INTO system_logs (usuario_executor, acao, detalhes) VALUES (?, ?, ?)';
    db.run(sql, [executor, acao, detalhes], function(err) {
        if (err) console.error('❌ Erro ao gravar log:', err);
    });
};

module.exports = { db, resend, registrarLog };