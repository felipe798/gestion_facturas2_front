import React, { useEffect, useState } from 'react';
import API from '../services/api';
import '../styles/AdminDashboard.css'; // Ajusta la ruta según la ubicación

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';

const AdminDashboard = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [proveedores, setProveedores] = useState([]);

    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        rol: 'Gerente',
    });

    const [formProveedor, setFormProveedor] = useState({
        nombre: '',
        email: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const fetchUsuarios = async () => {
        try {
            const response = await API.get('usuarios/', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setUsuarios(response.data);
        } catch (error) {
            alert('Error al obtener usuarios');
        }
    };

    const fetchProveedores = async () => {
        try {
            const response = await API.get('usuarios/proveedores/', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setProveedores(response.data);
        } catch (error) {
            alert('Error al obtener proveedores');
        }
    };

    useEffect(() => {
        fetchUsuarios();
        fetchProveedores();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProveedorChange = (e) => {
        setFormProveedor({ ...formProveedor, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await API.put(`usuarios/${editId}/`, formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                alert('Usuario actualizado correctamente');
            } else {
                await API.post('usuarios/', formData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                alert('Usuario creado correctamente');
            }
            setFormData({ nombre: '', email: '', password: '', rol: 'Gerente' });
            setIsEditing(false);
            setEditId(null);
            fetchUsuarios();
        } catch (error) {
            alert('Error al guardar el usuario');
        }
    };

    const handleProveedorSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('usuarios/proveedores/', formProveedor, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            alert('Proveedor creado correctamente');
            setFormProveedor({ nombre: '', email: '' });
            fetchProveedores();
        } catch (error) {
            alert('Error al guardar el proveedor');
        }
    };

    const handleEdit = (usuario) => {
        setFormData({
            nombre: usuario.nombre,
            email: usuario.email,
            password: '',
            rol: usuario.rol,
        });
        setIsEditing(true);
        setEditId(usuario.id);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            try {
                await API.delete(`usuarios/${id}/`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                alert('Usuario eliminado correctamente');
                fetchUsuarios();
            } catch (error) {
                alert('Error al eliminar el usuario');
            }
        }
    };

    return (
        <div className="admin-dashboard">
            <h2>Gestión de Usuarios</h2>
            <form onSubmit={handleSubmit} className="form-container">
                <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    value={formData.email}
                    onChange={handleChange}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={handleChange}
                />
                <select name="rol" value={formData.rol} onChange={handleChange}>
                    <option value="Gerente">Gerente</option>
                    <option value="Contador">Contador</option>
                </select>
                <button type="submit" className="primary-button">
                    {isEditing ? 'Actualizar' : 'Crear'} Usuario
                    <FontAwesomeIcon icon={faPlus} style={{ marginLeft: '10px' }} />
                </button>
            </form>

            <h3>Lista de Usuarios</h3>
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((usuario) => (
                        <tr key={usuario.id}>
                            <td>{usuario.nombre}</td>
                            <td>{usuario.email}</td>
                            <td>{usuario.rol}</td>
                            <td className="action-buttons">
                                <button className="edit-button" onClick={() => handleEdit(usuario)}>
                                    <FontAwesomeIcon icon={faEdit} />
                                    Editar
                                </button>
                                <button className="delete-button" onClick={() => handleDelete(usuario.id)}>
                                    <FontAwesomeIcon icon={faTrash} />
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>Gestión de Proveedores</h2>
            <form onSubmit={handleProveedorSubmit} className="form-container">
                <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre del proveedor"
                    value={formProveedor.nombre}
                    onChange={handleProveedorChange}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico del proveedor"
                    value={formProveedor.email}
                    onChange={handleProveedorChange}
                />
                <button type="submit" className="primary-button">
                    Crear Proveedor
                    <FontAwesomeIcon icon={faPlus} style={{ marginLeft: '10px' }} />
                </button>
            </form>

            <h3>Lista de Proveedores</h3>
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    {proveedores.map((proveedor) => (
                        <tr key={proveedor.id}>
                            <td>{proveedor.nombre}</td>
                            <td>{proveedor.email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;
