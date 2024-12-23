// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import ContadorDashboard from './components/ContadorDashboard';
import Dashboard from './components/Dashboard';
import ImportarFacturasProveedores from './components/ImportarFacturasProveedores';
import Notificaciones from './components/Notificaciones';
import MainLayout from './components/MainLayout';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route element={<MainLayout />}>
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute roles={['Administrador']}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/contador"
                            element={
                                <ProtectedRoute roles={['Contador',]}>
                                    <ContadorDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute roles={['Administrador', 'Gerente']}>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/proveedores/importar"
                            element={
                                <ProtectedRoute roles={['Contador', 'Administrador']}>
                                    <ImportarFacturasProveedores />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/notificaciones"
                            element={
                                <ProtectedRoute roles={['Contador', 'Administrador']}>
                                    <Notificaciones />
                                </ProtectedRoute>
                            }
                        />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
