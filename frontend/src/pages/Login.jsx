import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../services/auth';
import { useAuth } from '../AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login: setContextLogin } = useAuth();
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: 'danger' });
    const [view, setView] = useState('login');
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [recoveryCode, setRecoveryCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const showMessage = (text, type = 'danger') => {
        setMessage({ text, type });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        showMessage('');
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: username, senha: password })
            });
            const data = await res.json();

            if (data.success) {
                const userData = data.user || data;
                setContextLogin(userData);
                
                const isAdmin = userData.groups.includes('admin') || userData.groups.includes('master_admin');
                navigate(isAdmin ? '/admin' : '/dashboard');
            } else {
                showMessage(data.message || "Usuário ou senha inválidos.");
            }
        } catch {
            showMessage("Erro: Servidor RM offline ou indisponível.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgot = async (e) => {
        e.preventDefault();
        setLoading(true);
        showMessage('Verificando e-mail...', 'primary');
        try {
            const res = await fetch(`${API_URL}/solicitar-codigo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: recoveryEmail })
            });
            const data = await res.json();
            if (data.success) {
                showMessage('');
                setView('verify');
            } else {
                showMessage(data.message || "E-mail não encontrado.");
            }
        } catch {
            showMessage("Erro de conexão.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/validar-codigo`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: recoveryEmail, code: recoveryCode })
            });
            const data = await res.json();
            if (data.success) setView('reset');
            else showMessage("Código incorreto ou expirado.");
        } catch {
            showMessage("Erro na validação do código.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) return showMessage("As senhas não coincidem!");
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/resetar-senha`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: recoveryEmail, newPass: newPassword })
            });
            const data = await res.json();
            if (data.success) {
                alert("Senha atualizada com sucesso! Por favor, faça login.");
                setView('login');
                setUsername('');
                setPassword('');
            }
        } catch {
            showMessage("Erro ao redefinir senha.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex align-items-center justify-content-center min-vh-100">
            <div className="card p-4 shadow auth-card" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="text-center mb-4">
                    <img src="/assets/images/RMLogo.png" alt="RM Technologies" className="img-fluid logo-branding" />
                </div>
                
                {message.text && <p className={`text-${message.type} text-center small fw-bold mt-3`}>{message.text}</p>}

                {view === 'login' && (
                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label className="form-label">Usuário</label>
                            <input type="text" className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Senha</label>
                            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary w-100" disabled={loading}>Entrar</button>
                        <div className="text-center mt-3">
                            <a href="#" className="small text-decoration-none" onClick={(e) => { e.preventDefault(); setView('forgot'); showMessage(''); }}>Esqueci minha senha</a>
                        </div>
                    </form>
                )}

                {view === 'forgot' && (
                    <form onSubmit={handleForgot}>
                        <p className="small text-muted text-center">Informe seu e-mail para receber o código de recuperação.</p>
                        <div className="mb-3"><input type="email" className="form-control" placeholder="Seu e-mail" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} required /></div>
                        <button type="submit" className="btn btn-primary w-100 mb-2" disabled={loading}>Enviar Código</button>
                        <button type="button" className="btn btn-light border w-100" onClick={() => { setView('login'); showMessage(''); }}>Voltar</button>
                    </form>
                )}

                {view === 'verify' && (
                    <form onSubmit={handleVerify}>
                        <p className="small text-muted text-center">Digite o código de 6 dígitos enviado para o seu e-mail.</p>
                        <div className="mb-3"><input type="text" className="form-control text-center fs-4" maxLength="6" value={recoveryCode} onChange={e => setRecoveryCode(e.target.value)} required /></div>
                        <button type="submit" className="btn btn-primary w-100 mb-2" disabled={loading}>Validar Código</button>
                        <button type="button" className="btn btn-light border w-100" onClick={() => setView('login')}>Cancelar</button>
                    </form>
                )}

                {view === 'reset' && (
                    <form onSubmit={handleReset}>
                        <div className="mb-3"><input type="password" className="form-control" placeholder="Nova Senha" value={newPassword} onChange={e => setNewPassword(e.target.value)} required /></div>
                        <div className="mb-3"><input type="password" className="form-control" placeholder="Confirmar Senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required /></div>
                        <button type="submit" className="btn btn-success w-100 mb-2" disabled={loading}>Salvar Nova Senha</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;