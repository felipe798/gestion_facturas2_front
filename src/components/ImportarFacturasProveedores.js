import React, { useState, useEffect, useMemo } from 'react';
import API from '../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faSearch, faCheckCircle, faFilePdf, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '../styles/ImportarFacturasProveedores.css';
import { usePDF } from 'react-to-pdf';

const ImportarFacturasProveedores = () => {
    const [archivo, setArchivo] = useState(null);
    const [proveedoresFacturas, setProveedoresFacturas] = useState([]);
    const [filters, setFilters] = useState({
        proveedor: '',
        numeroFactura: '',
        estado: '',
        fechaInicio: '',
        fechaFin: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const { toPDF, targetRef } = usePDF({ filename: 'facturas-proveedores.pdf' });

    const handleFileChange = (e) => {
        setArchivo(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!archivo) {
            alert('Por favor, selecciona un archivo CSV');
            return;
        }
        const formData = new FormData();
        formData.append('archivo', archivo);
        try {
            const response = await API.post('usuarios/facturas/proveedores/importar/', formData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            alert(response.data.mensaje || 'Facturas importadas correctamente');
            fetchProveedoresFacturas();
        } catch (error) {
            console.error('Error al importar facturas:', error.response?.data || error.message);
            alert(error.response?.data?.error || 'Error al importar facturas');
        }
    };

    const fetchProveedoresFacturas = async () => {
        try {
            const response = await API.get('usuarios/facturas/proveedores/', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setProveedoresFacturas(response.data);
        } catch (error) {
            console.error('Error al obtener facturas de proveedores:', error);
        }
    };

    const handleEstadoChange = async (facturaId, nuevoEstado, fechaVencimiento) => {
        const fechaActual = new Date();
        const fechaVencimientoDate = new Date(fechaVencimiento);

        if (nuevoEstado === 'Vencida' && fechaActual < fechaVencimientoDate) {
            alert('No se puede cambiar el estado a Vencida antes de la fecha de vencimiento');
            return;
        }

        if (nuevoEstado === 'Pendiente' && fechaActual > fechaVencimientoDate) {
            alert('No se puede cambiar el estado a Pendiente después de la fecha de vencimiento');
            return;
        }

        try {
            const response = await API.patch(
                `usuarios/facturas/${facturaId}/`,
                { estado: nuevoEstado },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            alert(response.data.mensaje || 'Estado actualizado correctamente');
            fetchProveedoresFacturas();
        } catch (error) {
            console.error('Error al actualizar estado de la factura:', error);
            alert(error.response?.data?.error || 'No se pudo actualizar el estado');
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        fetchProveedoresFacturas();
    }, []);

    const filteredFacturas = useMemo(() => {
        return proveedoresFacturas.flatMap(proveedor => 
            proveedor.facturas.filter(factura => {
                const matchesProveedor = !filters.proveedor || factura.proveedor_nombre.toLowerCase().includes(filters.proveedor.toLowerCase());
                const matchesNumeroFactura = !filters.numeroFactura || factura.numero_factura.toString().includes(filters.numeroFactura);
                const matchesEstado = !filters.estado || factura.estado === filters.estado;
                const matchesFecha = (!filters.fechaInicio || new Date(factura.fecha_emision) >= new Date(filters.fechaInicio)) &&
                                     (!filters.fechaFin || new Date(factura.fecha_emision) <= new Date(filters.fechaFin));
                return matchesProveedor && matchesNumeroFactura && matchesEstado && matchesFecha;
            })
        );
    }, [proveedoresFacturas, filters]);

    // Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredFacturas.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredFacturas.length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="importar-facturas" ref={targetRef}>
            <h2 className="title">
                <FontAwesomeIcon icon={faUpload} /> Importar Facturas para Proveedores
            </h2>
            <form onSubmit={handleSubmit} className="upload-form">
                <input type="file" accept=".csv" onChange={handleFileChange} className="file-input" />
                <button type="submit" className="upload-button">
                    <FontAwesomeIcon icon={faUpload} /> Subir Archivo
                </button>
            </form>
            <h3 className="filter-title">
                <FontAwesomeIcon icon={faSearch} /> Buscar Facturas
            </h3>
            <div className="filter-container">
                <input
                    type="text"
                    name="proveedor"
                    placeholder="Buscar por proveedor"
                    value={filters.proveedor}
                    onChange={handleFilterChange}
                    className="filter-input"
                />
                <input
                    type="text"
                    name="numeroFactura"
                    placeholder="Buscar por número de factura"
                    value={filters.numeroFactura}
                    onChange={handleFilterChange}
                    className="filter-input"
                />
                <select
                    name="estado"
                    value={filters.estado}
                    onChange={handleFilterChange}
                    className="filter-select"
                >
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
                    className="filter-input"
                />
                <input
                    type="date"
                    name="fechaFin"
                    value={filters.fechaFin}
                    onChange={handleFilterChange}
                    className="filter-input"
                />
            </div>
            <button onClick={() => toPDF()} className="export-pdf-button">
                <FontAwesomeIcon icon={faFilePdf} /> Exportar a PDF
            </button>
            <h3 className="section-title">Facturas Filtradas</h3>
            <table className="facturas-table">
                <thead>
                    <tr>
                        <th>Número de Factura</th>
                        <th>Proveedor</th>
                        <th>Fecha de Emisión</th>
                        <th>Fecha de Vencimiento</th>
                        <th>Monto Total</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems.map((factura) => (
                        <tr key={factura.id}>
                            <td>{factura.numero_factura}</td>
                            <td>{factura.proveedor_nombre}</td>
                            <td>{factura.fecha_emision}</td>
                            <td>{factura.fecha_vencimiento}</td>
                            <td>${factura.monto_total}</td>
                            <td>
                                <select
                                    value={factura.estado}
                                    onChange={(e) => handleEstadoChange(factura.id, e.target.value, factura.fecha_vencimiento)}
                                    className="estado-select"
                                >
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Pagada">Pagada</option>
                                    <option value="Vencida">Vencida</option>
                                </select>
                            </td>
                            <td>
                                <button
                                    onClick={() => handleEstadoChange(factura.id, 'Pagada', factura.fecha_vencimiento)}
                                    className="action-button"
                                    disabled={factura.estado === 'Pagada'}
                                >
                                    <FontAwesomeIcon icon={faCheckCircle} /> Marcar como Pagada
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="pagination">
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="pagination-button">
                    <FontAwesomeIcon icon={faChevronLeft} /> Anterior
                </button>
                {pageNumbers.map(number => (
                    <button key={number} onClick={() => paginate(number)} className={`pagination-button ${currentPage === number ? 'active' : ''}`}>
                        {number}
                    </button>
                ))}
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === pageNumbers.length} className="pagination-button">
                    Siguiente <FontAwesomeIcon icon={faChevronRight} />
                </button>
            </div>
        </div>
    );
};

export default ImportarFacturasProveedores;