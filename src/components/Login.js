import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Login.css'; // Actualiza la ruta del archivo CSS

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await API.post('usuarios/login/', { email, password });
            const { access, rol } = response.data;

            login(rol, access);

            if (rol === 'Administrador') navigate('/admin');
            else if (rol === 'Contador') navigate('/contador');
            else if (rol === 'Gerente') navigate('/dashboard');
            else alert('Rol no reconocido.');
        } catch (error) {
            alert('Credenciales incorrectas');
        }
    };

    return (
        <div className="container">
            <div className="form">
                <div className="form_front">
                    <p className="form_details">Iniciar Sesión</p>
                    <form onSubmit={handleLogin}>
                        <input
                            type="email"
                            className="input"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            className="input"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button type="submit" className="btn">Ingresar</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
