// src/components/Mesero/AgregarPedidoModal.jsx
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import app from '../../firebaseConfig'; // Importa tu configuración actual
import './AgregarPedidoModal.css';

const AgregarPedidoModal = ({ isOpen, onClose, onSubmit }) => {
  // Obtiene la instancia de Firestore usando tu app configurada
  const db = getFirestore(app);
  
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [pedido, setPedido] = useState({
    nombreCliente: '',
    numeroComensales: 1,
    items: [],
    notas: ''
  });

  const [itemsCantidad, setItemsCantidad] = useState({});

  // Función para cargar los platillos desde Firestore
  const cargarPlatillos = async () => {
    setLoading(true);
    setError(null);
    try {
      const querySnapshot = await getDocs(collection(db, 'platillos'));
      const platillos = [];
      
      querySnapshot.forEach((doc) => {
        platillos.push({
          id: doc.id,
          descripcion: doc.data().descripcion,
          nombre: doc.data().nombre,
          precio: doc.data().precio || 'Otros'
        });
      });
      
      setMenuItems(platillos);
    } catch (err) {
      console.error("Error al cargar platillos:", err);
      setError("No se pudo cargar el menú. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      cargarPlatillos();
    }
  }, [isOpen]);

  const agregarItem = (item) => {
    const cantidad = itemsCantidad[item.id] || 0;
    if (cantidad > 0) {
      setPedido(prev => {
        const itemExistente = prev.items.find(i => i.id === item.id);
        
        if (itemExistente) {
          return {
            ...prev,
            items: prev.items.map(i => 
              i.id === item.id ? {...i, cantidad} : i
            )
          };
        } else {
          return {
            ...prev,
            items: [...prev.items, {...item, cantidad}]
          };
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pedido.items.length === 0) {
      setError("Debes agregar al menos un ítem al pedido");
      return;
    }
    
    try {
      // Agrega el pedido a Firestore
      await addDoc(collection(db, 'pedidos'), {
        ...pedido,
        fecha: new Date(),
        estado: 'pendiente',
        mesero: usuario?.email || 'Anónimo'
      });
      
      onSubmit(pedido);
      onClose();
    } catch (error) {
      console.error("Error al guardar pedido:", error);
      setError("Error al guardar el pedido");
    }
  };

  if (!isOpen) return null;

  // Agrupar ítems por categoría
  const itemsPorCategoria = menuItems.reduce((acc, item) => {
    const categoria = item.categoria || 'Otros';
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(item);
    return acc;
  }, {});

  return (
    <div className="modal-overlay">
      <div className="agregar-pedido-modal">
        <div className="modal-header">
          <h2>Nuevo Pedido</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        {loading ? (
          <div className="loading-message">Cargando menú...</div>
        ) : error ? (
          <div className="error-message">
            {error}
            <button onClick={cargarPlatillos} className="btn-retry">
              Reintentar
            </button>
          </div>
        ) : (
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
                  onChange={(e) => setPedido({...pedido, numeroComensales: parseInt(e.target.value) || 1})}
                  required
                />
              </div>
            </div>

            <div className="menu-container">
              <h3>Menú</h3>
              {Object.entries(itemsPorCategoria).map(([categoria, items]) => (
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
                              [item.id]: Math.max(0, parseInt(e.target.value) || 0)
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
              {pedido.items.length === 0 ? (
                <p className="empty-message">No hay ítems en el pedido</p>
              ) : (
                <>
                  <div className="items-seleccionados">
                    {pedido.items.map(item => (
                      <div key={item.id} className="item-resumen">
                        <span>{item.cantidad}x {item.nombre}</span>
                        <span>${item.precio * item.cantidad}</span>
                      </div>
                    ))}
                  </div>
                  <div className="total-pedido">
                    <strong>Total: </strong>
                    <span>${pedido.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)}</span>
                  </div>
                </>
              )}
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
              <button type="submit" className="btn-confirmar" disabled={pedido.items.length === 0}>
                Confirmar Pedido
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AgregarPedidoModal;