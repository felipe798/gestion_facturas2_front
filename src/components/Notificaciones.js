import React, { useEffect, useState } from 'react';
import API from '../services/api';
import '../styles/Notificaciones.css';

const Notificaciones = () => {
    const [facturasVencidas, setFacturasVencidas] = useState([]);
    const [clientesYProveedores, setClientesYProveedores] = useState([]);
    const [rolUsuario, setRolUsuario] = useState(null);

    useEffect(() => {
        const fetchRolUsuario = async () => {
            try {
                const response = await API.get('usuarios/rol/', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setRolUsuario(response.data.rol);
            } catch (error) {
                console.error('Error al verificar el rol del usuario:', error);
            }
        };

        const fetchFacturasVencidas = async () => {
            try {
                const response = await API.get('usuarios/facturas/', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });

                const vencidas = response.data.filter(
                    (factura) => factura.estado === 'Vencida'
                );

                setFacturasVencidas(vencidas);

                const afectados = vencidas.reduce((acc, factura) => {
                    const nombre = factura.cliente_nombre || factura.proveedor_nombre || 'Desconocido';

                    if (acc[nombre]) {
                        acc[nombre].count += 1;
                    } else {
                        acc[nombre] = { nombre, count: 1 };
                    }

                    return acc;
                }, {});

                setClientesYProveedores(Object.values(afectados));
            } catch (error) {
                console.error('Error al obtener facturas vencidas:', error);
            }
        };

        fetchRolUsuario();
        fetchFacturasVencidas();
    }, []);

    if (rolUsuario !== 'Contador' && rolUsuario !== 'Administrador') {
        return <p className="error-message">No tienes permiso para ver esta página</p>;
    }

    return (
        <div className="notificaciones-container">
            <h2 className="notificaciones-title">Notificaciones de Facturas Vencidas</h2>
            <div className="facturas-section">
                {facturasVencidas.length > 0 ? (
                    <ul className="facturas-list">
                        {clientesYProveedores.map((item, index) => (
                            <li key={index} className="factura-item">
                                <span className="factura-nombre">{item.nombre}</span>
                                <span className="factura-count">
                                    {item.count} {item.count === 1 ? 'factura vencida' : 'facturas vencidas'}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-facturas">No hay facturas vencidas.</p>
                )}
            </div>
        </div>
    );
};

export default Notificaciones;