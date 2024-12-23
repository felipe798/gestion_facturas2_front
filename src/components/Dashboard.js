import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import axios from "axios";
import { Calendar } from "lucide-react";
import { usePDF } from 'react-to-pdf';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';

const Dashboard = () => {
  const [data, setData] = useState({
    facturas_pagadas: [],
    facturas_vencidas: 0,
    comparacion_pagos: { pagos: 0, cobros: 0 },
    facturas_pagadas_clientes: 0,
    facturas_pagadas_proveedores: 0,
  });

  const { toPDF, targetRef } = usePDF({ filename: 'dashboard-financiero.pdf' });
  const currentMonth = new Date().toLocaleString('es-ES', { month: 'long' });
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://localhost:8000/api/usuarios/dashboard/estadisticas/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error.response?.data || error.message);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (value) => new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

  const formatNumber = (value) => new Intl.NumberFormat("es-ES", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value);

  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('es-ES', { month: 'long' });
  };

  return (
    <div ref={targetRef} style={{ padding: "20px", fontFamily: "Arial, sans-serif", backgroundColor: "#f9f9f9" }}>
      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#333", marginBottom: "10px" }}>
          Dashboard Financiero
        </h1>
        <p style={{ fontSize: "14px", color: "#666", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Calendar style={{ marginRight: "8px", width: "16px", height: "16px", color: "#888" }} />
          Datos actualizados: {currentMonth} {currentYear}
        </p>
        <button 
          onClick={() => toPDF()} 
          style={{
            backgroundColor: "#00aa33",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "10px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <FontAwesomeIcon icon={faFilePdf} />
          Exportar a PDF
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "30px" }}>
        <div style={{ background: "#ffffff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", padding: "20px", textAlign: "center" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#555", marginBottom: "5px" }}>
            Facturas Vencidas
          </h2>
          <p style={{ fontSize: "40px", fontWeight: "bold", color: "#4F46E5", margin: "10px 0" }}>
            {data.facturas_vencidas}
          </p>
          <p style={{ fontSize: "14px", color: "#888", marginTop: "10px" }}>
            Facturas pendientes de pago vencidas en {currentMonth}
          </p>
        </div>

        <div style={{ background: "#ffffff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", padding: "20px", textAlign: "center" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#555", marginBottom: "5px" }}>
            Facturas Cobradas
          </h2>
          <p style={{ fontSize: "40px", fontWeight: "bold", color: "#4F46E5", margin: "10px 0" }}>
            {data.facturas_pagadas_clientes}
          </p>
          <p style={{ fontSize: "14px", color: "#888", marginTop: "10px" }}>
            Total de facturas cobradas a clientes hasta la fecha
          </p>
        </div>

        <div style={{ background: "#ffffff", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", padding: "20px", textAlign: "center" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#555", marginBottom: "5px" }}>
            Facturas Pagadas
          </h2>
          <p style={{ fontSize: "40px", fontWeight: "bold", color: "#4F46E5", margin: "10px 0" }}>
            {data.facturas_pagadas_proveedores}
          </p>
          <p style={{ fontSize: "14px", color: "#888", marginTop: "10px" }}>
            Total de facturas pagadas a proveedores hasta la fecha
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        <div style={{ background: "#ffffff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#333", marginBottom: "10px" }}>
            Balance de Pagos y Cobros
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Pagos", value: data.comparacion_pagos.pagos },
                  { name: "Cobros", value: data.comparacion_pagos.cobros }
                ]}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                fill="#8884d8"
                label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
              >
                <Cell fill="#3B82F6" />
                <Cell fill="#10B981" />
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#ffffff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#333", marginBottom: "10px" }}>
            Evolución Mensual de Facturas
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.facturas_pagadas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha_emision__month" tickFormatter={getMonthName} />
              <YAxis tickFormatter={formatNumber} />
              <Tooltip formatter={(value) => formatNumber(value)} />
              <Legend />
              <Bar dataKey="total_pagadas" fill="#3B82F6" name="Facturas Pagadas" />
              <Bar dataKey="monto_pagado" fill="#10B981" name="Monto Pagado (S/)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;