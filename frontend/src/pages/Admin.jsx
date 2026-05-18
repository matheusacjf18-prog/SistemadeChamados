import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, Utils } from '../services/auth';
import { useAuth } from '../AuthContext';

const Admin = () => {
    const [abaAtiva, setAbaAtiva] = useState('chamados');
    const navigate = useNavigate();
    const { session, logout } = useAuth();
    
    const isMaster = session?.groups?.includes('master_admin');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="container-fluid py-4">
            <div className="row">
                <div className="col-md-3 mb-4">
                    <div className="list-group shadow-sm">
                        <button className={`list-group-item list-group-item-action ${abaAtiva === 'chamados' ? 'active' : ''}`} onClick={() => setAbaAtiva('chamados')}>📦 Chamados</button>
                        <button className={`list-group-item list-group-item-action ${abaAtiva === 'usuarios' ? 'active' : ''}`} onClick={() => setAbaAtiva('usuarios')}>👥 Usuários</button>
                        <button className={`list-group-item list-group-item-action ${abaAtiva === 'qrcodes' ? 'active' : ''}`} onClick={() => setAbaAtiva('qrcodes')}>🔲 Selos QR (Garantia)</button>
                        {isMaster && <button className={`list-group-item list-group-item-action text-danger fw-bold ${abaAtiva === 'logs' ? 'active' : ''}`} onClick={() => setAbaAtiva('logs')}>📜 Auditoria (Logs)</button>}
                        <button className="list-group-item list-group-item-action text-primary" onClick={() => navigate('/dashboard')}>Voltar ao Portal</button>
                        <button className="list-group-item list-group-item-action text-danger" onClick={handleLogout}>Sair</button>
                    </div>
                </div>
                <div className="col-md-9">
                    <div className="card shadow-sm p-4">
                        {abaAtiva === 'chamados' && <AdminChamados session={session} />}
                        {abaAtiva === 'usuarios' && <AdminUsuarios session={session} isMaster={isMaster} />}
                        {abaAtiva === 'qrcodes' && <AdminQRCodes />}
                        {abaAtiva === 'logs' && <AdminLogs session={session} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminChamados = ({ session }) => {
    const [chamados, setChamados] = useState([]);
    
    const carregar = () => fetch(`${API_URL}/admin/chamados`).then(r => r.json()).then(d => { if(d.success) setChamados(d.chamados) });
    useEffect(() => { carregar(); }, []);

    const alterarStatus = async (id, status) => {
        await fetch(`${API_URL}/admin/atualizar-status`, {
            method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ id, status, admin_executor: session.login })
        });
        carregar();
    };

    return (
        <table className="table table-hover align-middle">
            <thead><tr><th>ID</th><th>Assunto / Autor</th><th>Status</th><th>Ações</th></tr></thead>
            <tbody>
                {chamados.map(t => (
                    <tr key={t.id}>
                        <td className="notranslate">#{t.id}</td>
                        <td><div className="fw-bold">{t.subject}</div><small className="text-muted">{t.author_name}</small></td>
                        <td><span className={`badge ${Utils.getStatusBadgeClass(t.status)}`}>{t.status.toUpperCase()}</span></td>
                        <td>
                            <button translate="no" className="btn btn-sm btn-outline-primary me-2 notranslate" onClick={() => alterarStatus(t.id, 'atendimento')}>Atender</button>
                            <button translate="no" className="btn btn-sm btn-outline-success notranslate" onClick={() => alterarStatus(t.id, 'concluido')}>Fechar</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const AdminUsuarios = ({ session, isMaster }) => {
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioEdit, setUsuarioEdit] = useState(null);
    
    const [novoUser, setNovoUser] = useState({ fullname: '', username: '', email: '', password: '', groups: ['client'] });

    const carregar = () => fetch(`${API_URL}/admin/usuarios`).then(r => r.json()).then(d => { if(d.success) setUsuarios(d.usuarios) });
    useEffect(() => { carregar(); }, []);

    const handleCriarUsuario = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_URL}/admin/criar-usuario`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...novoUser, admin_executor: session.login })
        });
        const data = await res.json();
        if (data.success) {
            alert("Usuário cadastrado com sucesso!");
            setNovoUser({ fullname: '', username: '', email: '', password: '', groups: ['client'] });
            carregar();
        } else {
            alert(data.message || "Erro ao criar usuário.");
        }
    };

    const handleExcluir = async (id) => {
        if (!window.confirm("Atenção: Ação permanente. Deseja excluir?")) return;
        await fetch(`${API_URL}/admin/excluir-usuario/${id}/${session.login}`, { method: 'DELETE' });
        carregar();
    };

    const handleSalvarEdicao = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_URL}/admin/editar-usuario`, {
            method: 'PUT', headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify({ ...usuarioEdit, admin_logado: session.login })
        });
        if ((await res.json()).success) {
            alert("Usuário atualizado!");
            setUsuarioEdit(null);
            carregar();
        }
    };

    const toggleGroupNovo = (group) => {
        const groups = novoUser.groups.includes(group) ? novoUser.groups.filter(g => g !== group) : [...novoUser.groups, group];
        setNovoUser({...novoUser, groups});
    };

    const toggleGroupEdit = (group) => {
        const groups = usuarioEdit.groups.includes(group) ? usuarioEdit.groups.filter(g => g !== group) : [...usuarioEdit.groups, group];
        setUsuarioEdit({...usuarioEdit, groups});
    };

    return (
        <>
            <form onSubmit={handleCriarUsuario} className="row g-2 mb-5 p-3 bg-light rounded-4 border">
                <div className="col-md-6"><input type="text" className="form-control" placeholder="Nome Completo" value={novoUser.fullname} onChange={e => setNovoUser({...novoUser, fullname: e.target.value})} required /></div>
                <div className="col-md-6"><input type="text" className="form-control" placeholder="Login" value={novoUser.username} onChange={e => setNovoUser({...novoUser, username: e.target.value})} required /></div>
                <div className="col-md-6"><input type="email" className="form-control" placeholder="E-mail" value={novoUser.email} onChange={e => setNovoUser({...novoUser, email: e.target.value})} required /></div>
                <div className="col-md-6"><input type="password" className="form-control" placeholder="Senha" value={novoUser.password} onChange={e => setNovoUser({...novoUser, password: e.target.value})} required /></div>
                <div className="col-12 mt-3">
                    <div className="d-flex gap-3 p-2 bg-white rounded border">
                        <label><input type="checkbox" checked={novoUser.groups.includes('client')} onChange={() => toggleGroupNovo('client')} /> Cliente</label>
                        <label><input type="checkbox" checked={novoUser.groups.includes('admin')} onChange={() => toggleGroupNovo('admin')} /> Admin</label>
                        {isMaster && <label><input type="checkbox" checked={novoUser.groups.includes('master_admin')} onChange={() => toggleGroupNovo('master_admin')} /> Master</label>}
                    </div>
                </div>
                <button type="submit" className="btn btn-success w-100 mt-3">Criar Conta</button>
            </form>

            <table className="table table-sm align-middle">
                <thead><tr><th>Nome / Login</th><th>Grupo</th><th>Ações</th></tr></thead>
                <tbody>
                    {usuarios.map(u => {
                        const alvoEhMaster = u.userGroups && u.userGroups.includes('master_admin');
                        const podeMexer = !alvoEhMaster || isMaster;
                        return (
                            <tr key={u.userId}>
                                <td><div className="fw-bold">{u.fullName}</div><small className="text-muted">{u.userName}</small></td>
                                <td><span className="badge bg-light text-dark border">{u.userGroups || 'Cliente'}</span></td>
                                <td>
                                    {podeMexer ? (
                                        <>
                                            <button translate="no" className="btn btn-sm btn-light border me-2 notranslate" onClick={() => setUsuarioEdit({id: u.userId, fullname: u.fullName, email: u.userEmail, groups: u.userGroups ? u.userGroups.split(',') : [] })}>📝</button>
                                            <button translate="no" className="btn btn-sm btn-outline-danger notranslate" onClick={() => handleExcluir(u.userId)}>🗑️</button>
                                        </>
                                    ) : <span className="badge bg-warning-subtle text-warning">Protegido</span>}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {usuarioEdit && (
                <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div className="card p-4 w-100" style={{maxWidth: '500px'}}>
                        <h5>Editar Usuário</h5>
                        <form onSubmit={handleSalvarEdicao}>
                            <input type="text" className="form-control mb-2" value={usuarioEdit.fullname} onChange={e => setUsuarioEdit({...usuarioEdit, fullname: e.target.value})} />
                            <input type="email" className="form-control mb-3" value={usuarioEdit.email} onChange={e => setUsuarioEdit({...usuarioEdit, email: e.target.value})} />
                            <div className="d-flex gap-3 mb-3">
                                <label><input type="checkbox" checked={usuarioEdit.groups.includes('client')} onChange={() => toggleGroupEdit('client')} /> Cliente</label>
                                <label><input type="checkbox" checked={usuarioEdit.groups.includes('admin')} onChange={() => toggleGroupEdit('admin')} /> Admin</label>
                                <label><input type="checkbox" checked={usuarioEdit.groups.includes('master_admin')} disabled={!isMaster} onChange={() => toggleGroupEdit('master_admin')} /> Master</label>
                            </div>
                            <div className="d-flex gap-2">
                                <button type="button" className="btn btn-secondary w-50" onClick={() => setUsuarioEdit(null)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary w-50">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

const AdminQRCodes = () => {
    const [qrcodes, setQrcodes] = useState([]);
    const [label, setLabel] = useState('');
    const url = `http://${window.location.hostname}:3000/check-garantia`;

    const carregar = () => fetch(`${API_URL}/admin/lista-qrcodes`).then(r => r.json()).then(d => { if(d.success) setQrcodes(d.qrcodes) });
    useEffect(() => { carregar(); }, []);

    const handleGerar = async () => {
        if (!label) return alert("Dê um nome ao lote!");
        const res = await fetch(`${API_URL}/admin/gerar-qr`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label, target_url: url })
        });
        const data = await res.json();
        if (data.success) {
            setLabel(''); carregar(); visualizarEImprimir(data.id);
        }
    };

    const visualizarEImprimir = async (id) => {
        const res = await fetch(`${API_URL}/admin/qr-image/${id}`);
        const data = await res.json();
        if (data.success) {
            const win = window.open('', '_blank');
            win.document.write(`<html><body style="text-align:center;"><img src="${data.image}" style="width:300px;"><script>window.onload=function(){window.print();window.close();}</script></body></html>`);
        }
    };

    return (
        <div>
            <div className="d-flex gap-2 mb-4">
                <input type="text" className="form-control" placeholder="Identificação do Lote (Ex: Lote Dell)" value={label} onChange={e => setLabel(e.target.value)} />
                <button className="btn btn-primary text-nowrap" onClick={handleGerar}>Gerar Lote</button>
            </div>
            <table className="table table-hover align-middle">
                <thead><tr><th>Data</th><th>Lote</th><th>Ações</th></tr></thead>
                <tbody>
                    {qrcodes.map(qr => (
                        <tr key={qr.id}>
                            <td>{new Date(qr.created_at).toLocaleDateString()}</td>
                            <td>{qr.label}</td>
                            <td><button className="btn btn-info btn-sm text-white" onClick={() => visualizarEImprimir(qr.id)}>Imprimir</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AdminLogs = ({ session }) => {
    const [logs, setLogs] = useState([]);
    useEffect(() => {
        fetch(`${API_URL}/admin/logs/${session.login}`).then(r => r.json()).then(d => { if(d.success) setLogs(d.logs) });
    }, [session.login]);

    return (
        <div className="table-responsive" style={{maxHeight: '500px'}}>
            <table className="table table-sm small">
                <thead className="table-dark sticky-top"><tr><th>Data</th><th>Executor</th><th>Ação</th><th>Detalhes</th></tr></thead>
                <tbody>
                    {logs.map((l, i) => (
                        <tr key={i}><td>{Utils.formatDateTime(l.data_hora)}</td><td className="text-primary fw-bold">{l.usuario_executor}</td><td><span className="badge bg-secondary">{l.acao}</span></td><td>{l.detalhes}</td></tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Admin;