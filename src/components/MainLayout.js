import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/MainLayout.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignOutAlt,
  faDashboard,
  faBell,
  faFileImport,
  faUsersGear,
} from '@fortawesome/free-solid-svg-icons';
import API from '../services/api';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [facturasVencidas, setFacturasVencidas] = useState(0);

  const routes = {
    Administrador: [
      { path: '/dashboard', label: 'Dashboard', icon: faDashboard },
      { path: '/admin', label: 'Admin Dashboard', icon: faUsersGear },
      { path: '/notificaciones', label: 'Notificaciones', icon: faBell },
      { path: '/proveedores/importar', label: 'Importar Facturas Proveedores', icon: faFileImport },
    ],
    Gerente: [{ path: '/dashboard', label: 'Dashboard', icon: faDashboard }],
    Contador: [
      { path: '/notificaciones', label: 'Notificaciones', icon: faBell },
      { path: '/proveedores/importar', label: 'Importar Facturas Proveedores', icon: faFileImport },
      { path: '/contador', label: 'Contador Dashboard', className: 'contador-dashboard', icon: faUsersGear },
    ],
  };

  const availableRoutes = routes[user.rol] || [];

  useEffect(() => {
    const fetchFacturasVencidas = async () => {
      try {
        const response = await API.get('usuarios/facturas/vencidas/count/', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setFacturasVencidas(response.data.count);
      } catch (error) {
        console.error('Error al obtener el conteo de facturas vencidas:', error);
      }
    };

    fetchFacturasVencidas();

    // Configurar un intervalo para actualizar el conteo cada 5 minutos
    const interval = setInterval(fetchFacturasVencidas, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user.token]);

  if (!user.token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <header>
        <h1>Sistema de Gestión</h1>
        <div className="user-info">
          <p className="user-role">
            <FontAwesomeIcon
              icon={
                user.rol === 'Administrador'
                  ? faUsersGear
                  : user.rol === 'Gerente'
                  ? faDashboard
                  : faBell
              }
              className="role-icon"
            />
            <span>{user.rol}</span>
          </p>
          <button onClick={logout}>
            <FontAwesomeIcon
              icon={faSignOutAlt}
              style={{ marginRight: '5px' }}
              className="animated-icon bounce"
            />
            Cerrar sesión
          </button>
        </div>
      </header>
      <nav>
        <ul>
          {availableRoutes.map((route) => (
            <li
              key={route.path}
              className="nav-item"
              onClick={() => navigate(route.path)}
            >
              <FontAwesomeIcon icon={route.icon} className="animated-icon" />
              {route.label}
              {route.path === '/notificaciones' && facturasVencidas > 0 && (
                <span className="facturas-vencidas-badge">{facturasVencidas}</span>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;