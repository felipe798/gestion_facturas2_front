// src/contexts/AuthContext.js
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({
        rol: localStorage.getItem('rol') || null,
        token: localStorage.getItem('token') || null,
    });

    const login = (rol, token) => {
        setUser({ rol, token });
        localStorage.setItem('rol', rol);
        localStorage.setItem('token', token);
    };

    const logout = () => {
        setUser({ rol: null, token: null });
        localStorage.removeItem('rol');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
