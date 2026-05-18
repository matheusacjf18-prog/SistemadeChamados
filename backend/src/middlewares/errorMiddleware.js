// middlewares/errorMiddleware.js

exports.notFound = (req, res) => {
    console.log(`[404] Tentativa de acesso: ${req.originalUrl}`);

    // 1. Se for uma chamada de API (JSON)
    if (req.accepts('json') && (req.xhr || req.headers.accept.indexOf('json') > -1)) {
        return res.status(404).json({ 
            success: false, 
            message: 'Rota de API não encontrada.' 
        });
    }

    // 2. Se for acesso via navegador, envia a página HTML de redirecionamento
    res.status(404).send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>404 - RM Technologies</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { background-color: #f8fafc; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: sans-serif; }
                .card-404 { text-align: center; padding: 40px; border-radius: 16px; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-width: 500px; }
            </style>
        </head>
        <body>
            <div class="card-404">
                <h1 class="display-1 fw-bold text-muted">404</h1>
                <h2 class="h4 mb-4">Ops! Página não encontrada.</h2>
                <p class="text-muted mb-4">A rota <strong>${req.originalUrl}</strong> não existe.<br>
                Redirecionando em <span id="counter">5</span> segundos...</p>
                <a href="http://127.0.0.1:5500/public/index.html" class="btn btn-primary">Voltar ao Início</a>
            </div>
            <script>
                let count = 5;
                setInterval(() => {
                    count--;
                    document.getElementById('counter').innerText = count;
                    if (count <= 0) window.location.href = "http://127.0.0.1:5500/public/index.html";
                }, 1000);
            </script>
        </body>
        </html>
    `);
};