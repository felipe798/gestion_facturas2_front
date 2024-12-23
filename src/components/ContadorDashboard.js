import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import '../styles/ContadorDashboard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoice, faUserPlus, faFileCirclePlus, faBell } from '@fortawesome/free-solid-svg-icons';

const ContadorDashboard = () => {
    const [facturas, setFacturas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [formCliente, setFormCliente] = useState({ nombre: '', email: '' });
    const [formFactura, setFormFactura] = useState({
        numero_factura: '',
        cliente: '',
        fecha_emision: '',
        fecha_vencimiento: '',
        monto_total: '',
    });

    const [filters, setFilters] = useState({
        numeroFactura: '',
        cliente: '',
        estado: '',
        fechaInicio: '',
        fechaFin: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const headers = {
        Authorization: `Bearer ${token}`,
    };

    // Función para calcular la penalización por retraso
    const calcularPenalizacion = (monto, fechaVencimiento) => {
        const today = new Date();
        const fechaVencimientoDate = new Date(fechaVencimiento);
    
        let penalizacion = 0;
        if (fechaVencimientoDate < today) {
            const diferenciaDias = Math.floor((today - fechaVencimientoDate) / (1000 * 3600 * 24)); // Diferencia en días
            penalizacion = (diferenciaDias * 0.01) * parseFloat(monto); // Asegurar que monto es un número
        }
        const montoFinal = parseFloat(monto) + penalizacion; // Calcular monto final como número
        return { penalizacion, montoFinal };
    };
    

    // Función optimizada para obtener los datos solo una vez al montar el componente
    const fetchData = useCallback(async () => {
        if (isLoading) return;
    
        setIsLoading(true);
        try {
            const facturasData = await API.get('usuarios/facturas/', { headers });
            const clientesData = await API.get('usuarios/clientes/', { headers });
    
            const today = new Date();
            const facturasDeClientes = facturasData.data.filter(factura => factura.cliente);
    
            const updatedFacturas = facturasDeClientes.map((factura) => {
                const montoTotal = parseFloat(factura.monto_total); // Convertir monto_total a número
                const fechaVencimiento = new Date(factura.fecha_vencimiento);
                const { penalizacion, montoFinal } = calcularPenalizacion(montoTotal, factura.fecha_vencimiento);
    
                // Determinar el estado basado en la fecha
                let estado = factura.estado;
                if (estado !== 'Pagada' && fechaVencimiento < today) {
                    estado = 'Vencida';
                } else if (estado !== 'Pagada' && fechaVencimiento >= today) {
                    estado = 'Pendiente';
                }
    
                return {
                    ...factura,
                    monto_total: montoTotal,
                    penalizacion,
                    monto_final: montoFinal,
                    estado, // Actualizar estado
                };
            });
    
            setFacturas(updatedFacturas);
            setClientes(clientesData.data);
    
            const nextFacturaNumber =
                updatedFacturas.length > 0
                    ? Math.max(...updatedFacturas.map((f) => parseInt(f.numero_factura, 10))) + 1
                    : 1;
    
            setFormFactura((prev) => ({ ...prev, numero_factura: nextFacturaNumber }));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, headers]);
    
    

    useEffect(() => {
        fetchData();
    }, []);

    // Actualizar el estado de una factura
    const updateFacturaEstado = async (id, nuevoEstado) => {
        try {
            await API.patch(
                `usuarios/facturas/${id}/`,
                { estado: nuevoEstado },
                { headers }
            );
            alert('Estado de la factura actualizado');
            fetchData();
        } catch (error) {
            console.error('Error al actualizar el estado de la factura:', error);
            alert('No se pudo actualizar el estado de la factura');
        }
    };

    // Enviar el formulario para agregar un cliente
    const handleClienteSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('usuarios/clientes/', formCliente, { headers });
            alert('Cliente agregado correctamente');
            setFormCliente({ nombre: '', email: '' });
            fetchData();
        } catch (error) {
            console.error('Error al agregar cliente:', error);
            alert('No se pudo agregar el cliente');
        }
    };

    // Enviar el formulario para agregar una factura
    const handleFacturaSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formFactura,
                cliente: parseInt(formFactura.cliente, 10),
            };
            await API.post('usuarios/facturas/', payload, { headers });
            alert('Factura agregada correctamente');
            fetchData();
        } catch (error) {
            console.error('Error al agregar factura:', error);
            alert('No se pudo agregar la factura');
        }
    };

    // Descargar el PDF de una factura
    const handleDownloadPDF = async (facturaId, numeroFactura) => {
        try {
            const response = await API.get(`usuarios/facturas/${facturaId}/pdf/`, {
                headers,
                responseType: 'blob',
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Factura-${numeroFactura}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error al descargar PDF:', error);
            alert('No se pudo descargar el PDF.');
        }
    };

    // Aplicar filtros a las facturas
    const applyFilters = () => {
        return facturas.filter((factura) => {
            const matchesNumeroFactura =
                !filters.numeroFactura || factura.numero_factura.toString().includes(filters.numeroFactura);

            const matchesCliente =
                !filters.cliente || factura.cliente_nombre.toLowerCase().includes(filters.cliente.toLowerCase());

            const matchesEstado = !filters.estado || factura.estado === filters.estado;

            const matchesFecha =
                (!filters.fechaInicio || new Date(factura.fecha_emision) >= new Date(filters.fechaInicio)) &&
                (!filters.fechaFin || new Date(factura.fecha_emision) <= new Date(filters.fechaFin));

            return matchesNumeroFactura && matchesCliente && matchesEstado && matchesFecha;
        });
    };

    // Manejar cambios en los filtros
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="contador-dashboard">
            <h1>Gestión de Facturas</h1>
            <div className="button-container">
                <button onClick={() => navigate('/proveedores/importar')}>
                    <FontAwesomeIcon icon={faBell} /> Importar Facturas de Proveedores
                </button>
            </div>

            <h2>Buscar Facturas</h2>
            <div className="form-container">
                <input
                    type="text"
                    name="numeroFactura"
                    placeholder="Buscar por número de factura"
                    value={filters.numeroFactura}
                    onChange={handleFilterChange}
                />
                <input
                    type="text"
                    name="cliente"
                    placeholder="Buscar por cliente"
                    value={filters.cliente}
                    onChange={handleFilterChange}
                />
                <select name="estado" value={filters.estado} onChange={handleFilterChange}>
                    <option value="">Todos los estados</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Pagada">Pagada</option>
                    <option value="Vencida">Vencida</option>
                </select>
                <input
                    type="date"
                    name="fechaInicio"
                    value={filters.fechaInicio}
                    onChange={handleFilterChange}
                />
                <input
                    type="date"
                    name="fechaFin"
                    value={filters.fechaFin}
                    onChange={handleFilterChange}
                />
            </div>

            <h2>Agregar Cliente</h2>
            <form onSubmit={handleClienteSubmit} className="form-container">
                <input
                    type="text"
                    placeholder="Nombre del cliente"
                    value={formCliente.nombre}
                    onChange={(e) => setFormCliente({ ...formCliente, nombre: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="Email del cliente"
                    value={formCliente.email}
                    onChange={(e) => setFormCliente({ ...formCliente, email: e.target.value })}
                />
                <button type="submit" className="icon-button">
                    <FontAwesomeIcon icon={faUserPlus} /> Agregar Cliente
                </button>
            </form>

            <h2>Agregar Factura</h2>
            <form onSubmit={handleFacturaSubmit} className="form-container">
                <input type="text" placeholder="Número de factura" value={formFactura.numero_factura} readOnly />
                <select
                    value={formFactura.cliente}
                    onChange={(e) => setFormFactura({ ...formFactura, cliente: e.target.value })}
                >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map((cliente) => (
                        <option key={cliente.id} value={cliente.id}>{cliente.nombre}</option>
                    ))}
                </select>
                <input
                    type="date"
                    value={formFactura.fecha_emision}
                    onChange={(e) => setFormFactura({ ...formFactura, fecha_emision: e.target.value })}
                />
                <input
                    type="date"
                    value={formFactura.fecha_vencimiento}
                    onChange={(e) => setFormFactura({ ...formFactura, fecha_vencimiento: e.target.value })}
                />
                <input
                    type="number"
                    value={formFactura.monto_total}
                    onChange={(e) => setFormFactura({ ...formFactura, monto_total: e.target.value })}
                />
                <button type="submit" className="icon-button">
                    <FontAwesomeIcon icon={faFileCirclePlus} /> Agregar Factura
                </button>
            </form>

            <h2>Facturas</h2>
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Número</th>
                        <th>Cliente</th>
                        <th>Monto Original</th>
                        <th>Penalización</th>
                        <th>Monto Final</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {applyFilters().map((factura) => (
                        <tr key={factura.id}>
                            <td>{factura.numero_factura}</td>
                            <td>{factura.cliente_nombre || 'N/A'}</td>
                            <td>${Number(factura.monto_total).toFixed(2)}</td>
                            <td>${Number(factura.penalizacion).toFixed(2)}</td>
                            <td>${Number(factura.monto_final).toFixed(2)}</td>
                            <td>
                                <select
                                    value={factura.estado}
                                    onChange={(e) => updateFacturaEstado(factura.id, e.target.value)}
                                >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Pagada">Pagada</option>
                                    <option value="Vencida">Vencida</option>
                                </select>
                            </td>
                            <td>{factura.fecha_emision}</td>
                            <td>
                                <button
                                    className="icon-button"
                                    onClick={() => handleDownloadPDF(factura.id, factura.numero_factura)}
                                >
                                    <FontAwesomeIcon icon={faFileInvoice} /> Descargar PDF
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>

            </table>
        </div>
    );
};

export default ContadorDashboard;
