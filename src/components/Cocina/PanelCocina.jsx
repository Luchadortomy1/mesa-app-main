// src/components/Cocina/PanelCocina.jsx
import React from 'react';
import { useOrdenes } from '../../context/OrdenesContext';
import './PanelCocina.css';

const PanelCocina = ({ usuario }) => {
  const { ordenes, actualizarOrden, completarOrden } = useOrdenes();

  const calcularEstadisticas = () => {
    return {
      pendientes: ordenes.filter(orden => 
        orden.items.some(item => item.estado === "pendiente")).length,
      enProceso: ordenes.filter(orden => 
        orden.items.some(item => item.estado === "en_proceso") && 
        !orden.items.every(item => item.estado === "completado")).length,
      completados: ordenes.filter(orden => 
        orden.items.every(item => item.estado === "completado")).length
    };
  };

  const actualizarEstadoItem = (ordenId, itemId, nuevoEstado) => {
    const orden = ordenes.find(o => o.id === ordenId);
    if (!orden) return;

    const nuevosItems = orden.items.map(item => {
      if (item.id === itemId) {
        return { ...item, estado: nuevoEstado };
      }
      return item;
    });

    const todosCompletados = nuevosItems.every(item => item.estado === "completado");
    const algunPendiente = nuevosItems.some(item => item.estado === "pendiente");
    const nuevoEstadoOrden = todosCompletados ? "completado" : algunPendiente ? "pendiente" : "en_proceso";

    actualizarOrden(ordenId, {
      ...orden,
      items: nuevosItems,
      estado: nuevoEstadoOrden
    });
  };

  const handleCompletarOrden = (ordenId) => {
    const orden = ordenes.find(o => o.id === ordenId);
    if (!orden) return;

    if (!orden.items.every(item => item.estado === "completado")) {
      alert("Todos los items deben estar completados para finalizar la orden");
      return;
    }

    completarOrden(ordenId);
  };

  const estadisticas = calcularEstadisticas();

  const getPrioridadClase = (tiempo) => {
    const tiempoTranscurrido = Date.now() - new Date(tiempo).getTime();
    const minutos = tiempoTranscurrido / (1000 * 60);
    
    if (minutos > 30) return "alta";
    if (minutos > 15) return "media";
    return "baja";
  };

  return (
    <div className="panel-cocina">
      <header className="cocina-header">
        <div className="header-wrapper">
          <h2>Panel de Cocina</h2>
          <div className="usuario-info">
            <span className="chef-icon">👨‍🍳</span>
            <span className="chef-name">Chef: {usuario}</span>
          </div>
        </div>
        <div className="dashboard-stats">
          <div className="stat-item">
            <span className="stat-label">Pendientes</span>
            <span className="stat-value">{estadisticas.pendientes}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">En Proceso</span>
            <span className="stat-value">{estadisticas.enProceso}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completados</span>
            <span className="stat-value">{estadisticas.completados}</span>
          </div>
        </div>
      </header>

      <div className="ordenes-container">
        {ordenes.map(orden => (
          <div 
            key={orden.id} 
            className={`orden-card prioridad-${getPrioridadClase(orden.tiempo)}`}
          >
            <div className="orden-header">
              <div className="orden-titulo">
                <h3>{orden.mesa}</h3>
                <div className="orden-detalles">
                  <span className="tiempo">{new Date(orden.tiempo).toLocaleTimeString()}</span>
                  <span className="cliente">Cliente: {orden.nombreCliente}</span>
                </div>
              </div>
              <span className={`estado-badge ${orden.estado}`}>
                {orden.estado}
              </span>
            </div>
            
            <div className="items-lista">
              {orden.items.map(item => (
                <div key={item.id} className={`item-orden estado-${item.estado}`}>
                  <div className="item-info">
                    <span className="cantidad">{item.cantidad}x</span>
                    <span className="nombre">{item.nombre}</span>
                  </div>
                  <div className="item-acciones">
                    <button 
                      onClick={() => actualizarEstadoItem(orden.id, item.id, "en_proceso")}
                      className={`btn-estado ${item.estado === "en_proceso" ? "activo" : ""}`}
                      disabled={item.estado === "completado"}
                    >
                      En Proceso
                    </button>
                    <button 
                      onClick={() => actualizarEstadoItem(orden.id, item.id, "completado")}
                      className={`btn-estado ${item.estado === "completado" ? "activo" : ""}`}
                    >
                      Completado
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="orden-footer">
              <button 
                className={`btn-completar-orden ${orden.estado === "completado" ? "disponible" : ""}`}
                onClick={() => handleCompletarOrden(orden.id)}
                disabled={orden.estado !== "completado"}
              >
                Completar Orden
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PanelCocina;