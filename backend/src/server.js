const express = require('express');
const cors = require('cors');
require('dotenv').config();

const errorMiddleware = require('./middlewares/errorMiddleware'); // Importa o middleware
const apiRoutes = require('./routes/apiRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Rotas da API
app.use(apiRoutes);

// 2. Tarefas Agendadas
require('./tasks/cronTasks');

// 3. Rota de Status
app.get('/status', (req, res) => {
    res.json({ status: 'ONLINE', timestamp: new Date().toLocaleString('pt-BR') });
});

// 4. Rota de Redirecionamento do QRCode
app.get('/check-garantia', (req, res) => {
    // Pega o IP/Host que fez a requisição para não quebrar em outros dispositivos
    const host = req.hostname;
    res.redirect(`http://${host}:5173/`); // Ajuste a porta 5173 se usar outra no Frontend
});

// 5. Middleware de Erro 404 (Sempre por último)
app.use(errorMiddleware.notFound);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Servidor Modular RM rodando em http://0.0.0.0:${PORT} (Liberado na rede)`));