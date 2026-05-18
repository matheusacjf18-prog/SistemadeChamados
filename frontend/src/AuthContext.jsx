import { createContext, useContext, useState } from 'react';
import { SessionManager } from './services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(() => SessionManager.get());

    const login = (userData) => {
        SessionManager.save(userData);
        setSession(userData);
    };

    const logout = () => {
        SessionManager.clear();
        setSession(null);
    };

    const updateSession = (newUserData) => {
        SessionManager.save(newUserData);
        setSession(newUserData);
    };

    return (
        <AuthContext.Provider value={{ session, login, logout, updateSession }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro do AuthProvider');
    }
    return context;
};