// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ roles, children }) => {
    const { user } = useAuth();

    // Si el usuario no tiene token, redirige al login
    if (!user.token) {
        return <Navigate to="/" replace />;
    }

    // Si el rol del usuario no está en los roles permitidos, muestra mensaje o redirige
    if (!roles.includes(user.rol)) {
        return <p>No tienes permiso para acceder a esta página.</p>;
    }

    return children;
};

export default ProtectedRoute;
