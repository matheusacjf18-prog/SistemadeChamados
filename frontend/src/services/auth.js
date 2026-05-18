// Usa o IP do dispositivo atual (hostname) para permitir acesso na rede local
export const API_URL = `http://${window.location.hostname}:3000`;

export const SessionManager = {
    save(userData) {
        localStorage.setItem('rm_user_session', JSON.stringify(userData));
    },

    get() {
        const session = localStorage.getItem('rm_user_session');
        return session ? JSON.parse(session) : null;
    },

    clear() {
        localStorage.removeItem('rm_user_session');
    },

    isLogged() {
        return !!this.get();
    }
};

export const Utils = {
    formatPhone(value) {
        if (!value) return "Não informado";
        value = value.replace(/\D/g, ''); 
        if (value.length > 11) value = value.substring(0, 11);
        value = value.replace(/(\d{2})(\d)/, "($1) $2"); 
        value = value.replace(/(\d{5})(\d)/, "$1-$2"); 
        return value;
    },

    formatDateTime(dateISO) {
        if (!dateISO) return "--/--/----";
        const date = new Date(dateISO);
        return date.toLocaleString('pt-BR');
    },

    getStatusBadgeClass(status) {
        const map = {
            'aberto': 'bg-success',
            'atendimento': 'bg-info',
            'concluido': 'bg-secondary',
            'pendente': 'bg-warning text-dark'
        };
        return map[status.toLowerCase()] || 'bg-dark';
    }
};