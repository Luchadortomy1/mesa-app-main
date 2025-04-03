import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import app from '../../firebaseConfig';
import './PanelCocina.css';

const PanelCocina = ({ usuario }) => {
  const db = getFirestore(app);
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar órdenes desde Firestore
  useEffect(() => {
    const q = query(collection(db, 'pedidos'), where('estado', '!=', 'entregado'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordenesData = [];
      querySnapshot.forEach((doc) => {
        ordenesData.push({
          id: doc.id,
          ...doc.data(),
          tiempo: doc.data().fecha?.toDate() || new Date()
        });
      });
      setOrdenes(ordenesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const actualizarEstadoItem = async (ordenId, itemId, nuevoEstado) => {
    try {
      const ordenRef = doc(db, 'pedidos', ordenId);
      const orden = ordenes.find(o => o.id === ordenId);
      
      if (!orden) return;

      const nuevosItems = orden.items.map(item => {
        if (item.id === itemId) {
          return { ...item, estado: nuevoEstado };
        }
        return item;
      });

      const todosCompletados = nuevosItems.every(item => item.estado === "completado");
      const nuevoEstadoOrden = todosCompletados ? "completado" : "en_proceso";

      await updateDoc(ordenRef, {
        items: nuevosItems,
        estado: nuevoEstadoOrden
      });
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    }
  };

  const completarOrden = async (ordenId) => {
    try {
      const ordenRef = doc(db, 'pedidos', ordenId);
      await updateDoc(ordenRef, {
        estado: 'entregado',
        fechaEntrega: new Date()
      });
    } catch (error) {
      console.error("Error al completar orden:", error);
    }
  };

  const calcularEstadisticas = () => {
    return {
      pendientes: ordenes.filter(orden => 
        orden.estado === "pendiente").length,
      enProceso: ordenes.filter(orden => 
        orden.estado === "en_proceso").length,
      completados: ordenes.filter(orden => 
        orden.estado === "completado").length
    };
  };

  const getPrioridadClase = (tiempo) => {
    const tiempoTranscurrido = Date.now() - new Date(tiempo).getTime();
    const minutos = tiempoTranscurrido / (1000 * 60);
    
    if (minutos > 30) return "alta";
    if (minutos > 15) return "media";
    return "baja";
  };

  if (loading) {
    return <div className="panel-cocina">Cargando órdenes...</div>;
  }

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
            <span className="stat-value">{calcularEstadisticas().pendientes}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">En Proceso</span>
            <span className="stat-value">{calcularEstadisticas().enProceso}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Completados</span>
            <span className="stat-value">{calcularEstadisticas().completados}</span>
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
                <h3>Mesa {orden.numeroMesa}</h3>
                <div className="orden-detalles">
                  <span className="tiempo">{orden.tiempo.toLocaleTimeString()}</span>
                  <span className="cliente">Cliente: {orden.nombreCliente}</span>
                </div>
              </div>
              <span className={`estado-badge ${orden.estado}`}>
                {orden.estado.replace('_', ' ')}
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
                onClick={() => completarOrden(orden.id)}
                disabled={orden.estado !== "completado"}
              >
                Marcar como Entregado
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PanelCocina;