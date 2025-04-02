// src/components/Mesero/AgregarPedidoModal.jsx
import React, { useState } from 'react';
import './AgregarPedidoModal.css';

const menuItems = [
  { id: 1, nombre: 'Hamburguesa', precio: 120, categoria: 'Platos Principales' },
  { id: 2, nombre: 'Pizza', precio: 150, categoria: 'Platos Principales' },
  { id: 3, nombre: 'Ensalada César', precio: 90, categoria: 'Ensaladas' },
  { id: 4, nombre: 'Papas Fritas', precio: 60, categoria: 'Acompañamientos' },
  { id: 5, nombre: 'Refresco', precio: 30, categoria: 'Bebidas' },
  { id: 6, nombre: 'Cerveza', precio: 45, categoria: 'Bebidas' },
];

const AgregarPedidoModal = ({ isOpen, onClose, onSubmit }) => {
  const [pedido, setPedido] = useState({
    nombreCliente: '',
    numeroComensales: 1,
    items: [],
    notas: ''
  });

  const [itemsCantidad, setItemsCantidad] = useState({});

  const agregarItem = (item) => {
    const cantidad = itemsCantidad[item.id] || 0;
    if (cantidad > 0) {
      const itemExistente = pedido.items.find(i => i.id === item.id);
      if (itemExistente) {
        setPedido({
          ...pedido,
          items: pedido.items.map(i => 
            i.id === item.id 
              ? {...i, cantidad: cantidad}
              : i
          )
        });
      } else {
        setPedido({
          ...pedido,
          items: [...pedido.items, {...item, cantidad: cantidad}]
        });
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(pedido);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="agregar-pedido-modal">
        <div className="modal-header">
          <h2>Nuevo Pedido</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="cliente-info">
            <div className="form-group">
              <label>Nombre del Cliente</label>
              <input
                type="text"
                value={pedido.nombreCliente}
                onChange={(e) => setPedido({...pedido, nombreCliente: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Número de Comensales</label>
              <input
                type="number"
                min="1"
                value={pedido.numeroComensales}
                onChange={(e) => setPedido({...pedido, numeroComensales: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>

          <div className="menu-container">
            <h3>Menú</h3>
            {Object.groupBy(menuItems, item => item.categoria).map((items, categoria) => (
              <div key={categoria} className="categoria-section">
                <h4>{categoria}</h4>
                <div className="items-grid">
                  {items.map(item => (
                    <div key={item.id} className="menu-item">
                      <div className="item-info">
                        <span className="item-nombre">{item.nombre}</span>
                        <span className="item-precio">${item.precio}</span>
                      </div>
                      <div className="item-actions">
                        <input
                          type="number"
                          min="0"
                          value={itemsCantidad[item.id] || 0}
                          onChange={(e) => setItemsCantidad({
                            ...itemsCantidad,
                            [item.id]: parseInt(e.target.value) || 0
                          })}
                        />
                        <button
                          type="button"
                          onClick={() => agregarItem(item)}
                          className="btn-agregar-item"
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pedido-resumen">
            <h3>Resumen del Pedido</h3>
            <div className="items-seleccionados">
              {pedido.items.map(item => (
                <div key={item.id} className="item-resumen">
                  <span>{item.cantidad}x {item.nombre}</span>
                  <span>${item.precio * item.cantidad}</span>
                </div>
              ))}
            </div>
            <div className="form-group">
              <label>Notas adicionales</label>
              <textarea
                value={pedido.notas}
                onChange={(e) => setPedido({...pedido, notas: e.target.value})}
                placeholder="Especificaciones especiales, alergias, etc."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancelar" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-confirmar">
              Confirmar Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgregarPedidoModal;