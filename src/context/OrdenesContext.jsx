// src/context/OrdenesContext.jsx
import React, { createContext, useState, useContext } from 'react';

const OrdenesContext = createContext();

export const OrdenesProvider = ({ children }) => {
  const [ordenes, setOrdenes] = useState([]);

  const agregarOrden = (nuevaOrden) => {
    const ordenFormateada = {
      id: Date.now(),
      mesa: `Mesa ${nuevaOrden.numeroMesa}`,
      nombreCliente: nuevaOrden.nombreCliente,
      items: nuevaOrden.items.map(item => ({
        ...item,
        estado: "pendiente"
      })),
      tiempo: new Date().toISOString(),
      estado: "pendiente"
    };
    
    setOrdenes(prevOrdenes => [...prevOrdenes, ordenFormateada]);
    console.log('Nueva orden agregada:', ordenFormateada); // Para debugging
  };

  const actualizarOrden = (ordenId, nuevaOrden) => {
    setOrdenes(prevOrdenes => 
      prevOrdenes.map(orden => 
        orden.id === ordenId ? nuevaOrden : orden
      )
    );
  };

  const completarOrden = (ordenId) => {
    setOrdenes(prevOrdenes => 
      prevOrdenes.filter(orden => orden.id !== ordenId)
    );
  };

  return (
    <OrdenesContext.Provider value={{
      ordenes,
      agregarOrden,
      actualizarOrden,
      completarOrden
    }}>
      {children}
    </OrdenesContext.Provider>
  );
};

export const useOrdenes = () => {
  const context = useContext(OrdenesContext);
  if (!context) {
    throw new Error('useOrdenes debe ser usado dentro de un OrdenesProvider');
  }
  return context;
};