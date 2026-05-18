import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL, Utils } from '../services/auth';
import { useAuth } from '../AuthContext';

const Dashboard = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const { session, logout, updateSession } = useAuth(); 

    const initialView = searchParams.get('action') === 'garantia' ? 'garantias' : 'abrir-chamado';
    const [view, setView] = useState(initialView);

    const handleLogout = () => {
        if (window.confirm("Deseja realmente encerrar sua sessão?")) {
            logout();
            navigate('/');
        }
    };

    const isAdmin = session?.groups?.includes('admin') || session?.groups?.includes('master_admin');

    return (
        <div className="container py-5">
            <div className="row">
                <div className="col-md-3 mb-4">
                    <div className="text-center mb-4">
                        <img src="/assets/images/RMLogo.png" alt="RM Technologies" className="img-fluid logo-dashboard mx-auto d-block" />
                    </div>
                    <div className="list-group shadow-sm">
                        <button className={`list-group-item list-group-item-action ${view === 'abrir-chamado' ? 'active' : ''}`} onClick={() => setView('abrir-chamado')}>📝 Abrir Chamado</button>
                        <button className={`list-group-item list-group-item-action ${view === 'chamados' ? 'active' : ''}`} onClick={() => setView('chamados')}>📋 Meus Chamados</button>
                        <button className={`list-group-item list-group-item-action ${view === 'garantias' ? 'active' : ''}`} onClick={() => setView('garantias')}>🛡️ Garantias</button>
                        <button className={`list-group-item list-group-item-action ${view === 'perfil' ? 'active' : ''}`} onClick={() => setView('perfil')}>👤 Meus Dados</button>
                        {isAdmin && (
                            <button className="list-group-item list-group-item-action text-danger fw-bold" onClick={() => navigate('/admin')}>⚙️ Painel Admin</button>
                        )}
                        <button className="list-group-item list-group-item-action text-danger" onClick={handleLogout}>Sair</button>
                    </div>
                </div>
                <div className="col-md-9">
                    <div className="card p-4 shadow-sm">
                        <h4 className="border-bottom pb-3 mb-4">Olá, {session?.full_name}!</h4>
                        {view === 'abrir-chamado' && <FormChamado session={session} onViewTickets={() => setView('chamados')} />}
                        {view === 'chamados' && <ListaChamados session={session} />}
                        {view === 'garantias' && <ListaGarantias session={session} />}
                        {view === 'perfil' && <PerfilCliente session={session} updateSession={updateSession} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

const FormChamado = ({ session, onViewTickets }) => {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/enviar-chamado`, {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ user: session.login, subject, description })
            });
            const data = await res.json();
            if (data.success) {
                alert("✅ Chamado aberto com sucesso!");
                setSubject(''); setDescription('');
                onViewTickets();
            } else alert("❌ Erro ao abrir chamado: " + data.message);
        } catch { alert("❌ Erro de conexão com o servidor."); }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3"><label className="form-label">Assunto</label><input type="text" className="form-control" value={subject} onChange={e => setSubject(e.target.value)} required /></div>
            <div className="mb-3"><label className="form-label">Descrição Detalhada</label><textarea className="form-control" rows="4" value={description} onChange={e => setDescription(e.target.value)} required></textarea></div>
            <button type="submit" className="btn btn-primary w-100">Abrir Chamado</button>
        </form>
    );
};

const ListaChamados = ({ session }) => {
    const [chamados, setChamados] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/chamados?user=${session.login}`)
            .then(r => r.json())
            .then(d => { if (d.success) setChamados(d.chamados); setLoading(false); })
            .catch(() => setLoading(false));
    }, [session.login]);

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
    if (chamados.length === 0) return <p className="text-center text-muted">Nenhum chamado aberto.</p>;

    return chamados.map(t => (
        <div key={t.id} className={`card mb-3 p-3 border-start border-4 ${Utils?.getStatusBadgeClass ? Utils.getStatusBadgeClass(t.status) : 'border-secondary'} shadow-sm`}>
            <div className="d-flex justify-content-between">
                <div><span className="text-muted small notranslate">#{t.id}</span><h6 className="fw-bold mb-1">{t.subject}</h6></div>
                <span className={`badge ${Utils?.getStatusBadgeClass ? Utils.getStatusBadgeClass(t.status).replace('border', 'bg') : 'bg-secondary'}`}>{t.status.toUpperCase()}</span>
            </div>
            <p className="text-muted small my-2">{t.description}</p>
            <div className="text-end border-top pt-2" style={{fontSize: '0.7rem', color: '#94a3b8'}}>Aberto em: {Utils?.formatDateTime ? Utils.formatDateTime(t.created_at) : (t.created_at ? new Date(t.created_at).toLocaleString('pt-BR') : '')}</div>
        </div>
    ));
};

const ListaGarantias = ({ session }) => {
    const [garantias, setGarantias] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const identificadorUsuario = session?.userId || session?.id || session?.login;
        fetch(`${API_URL}/cliente/meus-ativos/${identificadorUsuario}`)
            .then(r => r.json())
            .then(d => { if (d.success) setGarantias(d.ativos); setLoading(false); })
            .catch(() => setLoading(false));
    }, [session]);

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
    if (garantias.length === 0) return <p className="text-center text-muted">Nenhum equipamento registrado.</p>;

    return (
        <div className="row g-3">
            {garantias.map(g => {
                const isExpirado = g.dias_restantes <= 0;
                const cor = isExpirado ? 'danger' : 'success';
                return (
                    <div key={g.id} className="col-md-6">
                        <div className={`card border-0 shadow-sm p-3 border-start border-4 border-${cor}`}>
                            <div className="fw-bold text-dark">{g.equipamento}</div>
                            <div className="small text-muted">Entrega: {new Date(g.data_entrega).toLocaleDateString('pt-BR')}</div>
                            <hr className="my-2" />
                            <div className="d-flex justify-content-between align-items-center">
                                <span className={`badge bg-${cor}-subtle text-${cor}`}>{isExpirado ? 'Expirada' : g.dias_restantes + ' dias restantes'}</span>
                                <small className="text-muted">Expira: {new Date(g.data_expiracao).toLocaleDateString('pt-BR')}</small>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const PerfilCliente = ({ session, updateSession }) => {
    const [formData, setFormData] = useState({
        nome: session?.full_name || '',
        email: session?.email || '',
        telephone: session?.telephone || '',
        novaSenha: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const telefoneFormatado = formData.telephone ? formData.telephone.replace(/\D/g, '') : '';
            const body = { 
                ...formData, 
                login: session.login, 
                telephone: telefoneFormatado 
            };
            const res = await fetch(`${API_URL}/atualizar-perfil`, {
                method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                alert("✅ Cadastro atualizado com sucesso!");
                const novaSessao = { 
                    ...session, 
                    full_name: formData.nome,
                    email: formData.email,
                    telephone: formData.telephone
                };
                updateSession(novaSessao);
            }
        } catch { alert("Erro ao salvar alterações."); }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3"><label className="form-label">Nome</label><input type="text" className="form-control" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required /></div>
            <div className="mb-3"><label className="form-label">E-mail</label><input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
            <div className="mb-3"><label className="form-label">Telefone</label><input type="text" className="form-control" value={formData.telephone} onChange={e => setFormData({...formData, telephone: Utils.formatPhone ? Utils.formatPhone(e.target.value) : e.target.value})} /></div>
            <div className="mt-4 pt-3 border-top">
                <h6 className="text-muted fw-bold small text-uppercase mb-3">Segurança</h6>
                <div className="mb-3"><input type="password" className="form-control" placeholder="Nova senha (deixe vazio para não alterar)" value={formData.novaSenha} onChange={e => setFormData({...formData, novaSenha: e.target.value})} /></div>
            </div>
            <button type="submit" className="btn btn-primary w-100">Salvar Alterações</button>
        </form>
    );
};

export default Dashboard;