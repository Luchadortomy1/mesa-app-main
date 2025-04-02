// src/components/Mesero/PanelMesero.jsx
import React, { useState } from 'react';
import './PanelMesero.css';
import { useOrdenes } from '../../context/OrdenesContext';

const menuItems = [
  { id: 1, nombre: 'Hamburguesa', precio: 120, categoria: 'Platos Principales' },
  { id: 2, nombre: 'Pizza', precio: 150, categoria: 'Platos Principales' },
  { id: 3, nombre: 'Ensalada César', precio: 90, categoria: 'Ensaladas' },
  { id: 4, nombre: 'Papas Fritas', precio: 60, categoria: 'Acompañamientos' },
  { id: 5, nombre: 'Refresco', precio: 30, categoria: 'Bebidas' },
  { id: 6, nombre: 'Cerveza', precio: 45, categoria: 'Bebidas' },
];

const PanelMesero = ({ usuario }) => {
  const { agregarOrden } = useOrdenes();
  const [mesas, setMesas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [nuevaMesa, setNuevaMesa] = useState({
    nombreCliente: '',
    numeroComensales: 1,
    pedidos: []
  });
  const [pedidoActual, setPedidoActual] = useState({});

  const agregarMesa = () => {
    setMesaSeleccionada(null);
    setShowModal(true);
    setPedidoActual({});
  };

  const handleSubmitMesa = (e) => {
    e.preventDefault();

    if (mesaSeleccionada) {
      // Actualizar mesa existente
      const mesaActualizada = {
        ...mesaSeleccionada,
        pedidos: [...mesaSeleccionada.pedidos, ...Object.values(pedidoActual)],
        total: calcularTotal([...mesaSeleccionada.pedidos, ...Object.values(pedidoActual)])
      };

      setMesas(mesas.map(m => m.id === mesaSeleccionada.id ? mesaActualizada : m));

      // Enviar nuevo pedido a cocina
      agregarOrden({
        numeroMesa: mesaSeleccionada.numero,
        nombreCliente: mesaSeleccionada.cliente,
        items: Object.values(pedidoActual).map(item => ({
          ...item,
          estado: 'pendiente'
        }))
      });
    } else {
      // Crear nueva mesa
      const mesaNueva = {
        id: Date.now(),
        numero: mesas.length + 1,
        cliente: nuevaMesa.nombreCliente,
        comensales: nuevaMesa.numeroComensales,
        pedidos: Object.values(pedidoActual),
        estado: 'activa',
        total: calcularTotal(Object.values(pedidoActual))
      };

      setMesas([...mesas, mesaNueva]);

      // Enviar orden inicial a cocina
      agregarOrden({
        numeroMesa: mesaNueva.numero,
        nombreCliente: mesaNueva.cliente,
        items: Object.values(pedidoActual).map(item => ({
          ...item,
          estado: 'pendiente'
        }))
      });
    }

    // Limpiar formulario
    setShowModal(false);
    setNuevaMesa({ nombreCliente: '', numeroComensales: 1, pedidos: [] });
    setPedidoActual({});
    setMesaSeleccionada(null);
  };

  const calcularTotal = (pedidos) => {
    return pedidos.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const actualizarCantidad = (itemId, cantidad) => {
    if (cantidad < 0) return;

    const item = menuItems.find(i => i.id === itemId);
    if (cantidad === 0) {
      const { [itemId]: _, ...resto } = pedidoActual;
      setPedidoActual(resto);
    } else {
      setPedidoActual({
        ...pedidoActual,
        [itemId]: { ...item, cantidad }
      });
    }
  };

  const agregarPedidoAMesa = (mesa) => {
    setMesaSeleccionada(mesa);
    setShowModal(true);
    setPedidoActual({});
  };

  const generarCuenta = (mesa) => {
    const cuenta = {
      mesa: mesa.numero,
      cliente: mesa.cliente,
      items: mesa.pedidos,
      total: mesa.total,
      fecha: new Date().toLocaleString()
    };

    // Aquí podrías implementar la impresión o envío de la cuenta
    console.log('Cuenta generada:', cuenta);

    // Actualizar estado de la mesa
    setMesas(mesas.map(m =>
      m.id === mesa.id ? { ...m, estado: 'completada' } : m
    ));
  };

  return (
    <div className="panel-mesero">
      <header>
        <div className="header-conten">
          <h2>Agregue su pedido</h2>
        </div>
      </header>

      <div className="dashboard">
        <div className="stats-container">
          <div className="stat-card">
            <h4>Mesas Activas</h4>
            <p>{mesas.length}</p>
          </div>
          <div className="stat-card">
            <h4>Por Cobrar</h4>
            <p>{mesas.filter(m => m.estado === 'activa').length}</p>
          </div>
        </div>

       
        <section className="mesas-container">
  <h3>Mis Mesas</h3>

  <div className="mesas-grid">
    {/* Botón fijo en la primera celda */}
    <button className="btn-agregar" onClick={agregarMesa}>
      <span className="btn-icon">+</span>
    </button>

    {/* Renderizar mesas */}
    {mesas.map((mesa, index) => (
      <div key={mesa.id} className="mesa-card">
        <div className="mesa-header">
          <h4>Mesa {mesa.numero}</h4>
          <span className={`estado ${mesa.estado}`}>
            {mesa.estado}
          </span>
        </div>
        <div className="mesa-info">
          <p>Cliente: {mesa.cliente}</p>
          <p>Comensales: {mesa.comensales}</p>
          <p>Total: ${mesa.total}</p>
        </div>
        <div className="mesa-actions">
          <button className="btn-menu" onClick={() => agregarPedidoAMesa(mesa)} disabled={mesa.estado === 'completada'}>
            <span className="icon">📋</span>
            <span>Menú</span>
          </button>
          <button className="btn-cuenta" onClick={() => generarCuenta(mesa)} disabled={mesa.estado === 'completada'}>
            <span className="icon">💰</span>
            <span>Cuenta</span>
          </button>
        </div>
      </div>
    ))}
  </div>
</section>

      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{mesaSeleccionada ? `Agregar Pedido - Mesa ${mesaSeleccionada.numero}` : 'Nueva Mesa'}</h2>
            <form onSubmit={handleSubmitMesa}>
              {!mesaSeleccionada && (
                <>
                  <div className="form-group">
                    <label>Nombre del Cliente</label>
                    <input
                      type="text"
                      value={nuevaMesa.nombreCliente}
                      onChange={(e) => setNuevaMesa({ ...nuevaMesa, nombreCliente: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Número de Comensales</label>
                    <input
                      type="number"
                      min="1"
                      value={nuevaMesa.numeroComensales}
                      onChange={(e) => setNuevaMesa({ ...nuevaMesa, numeroComensales: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </>
              )}

              <div className="menu-section">
                <h3>Menú</h3>
                {Object.entries(Object.groupBy(menuItems, item => item.categoria)).map(([categoria, items]) => (
                  <div key={categoria} className="categoria-menu">
                    <h4>{categoria}</h4>
                    <div className="items-grid">
                      {items.map(item => (
                        <div key={item.id} className="menu-item">
                          <div className="item-info">
                            <span>{item.nombre}</span>
                            <span>${item.precio}</span>
                          </div>
                          <div className="item-cantidad">
                            <button
                              type="button"
                              onClick={() => actualizarCantidad(item.id, (pedidoActual[item.id]?.cantidad || 0) - 1)}
                            >
                              -
                            </button>
                            <span>{pedidoActual[item.id]?.cantidad || 0}</span>
                            <button
                              type="button"
                              onClick={() => actualizarCantidad(item.id, (pedidoActual[item.id]?.cantidad || 0) + 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="resumen-pedido">
                <h3>Resumen del Pedido</h3>
                <div className="items-seleccionados">
                  {Object.values(pedidoActual).map(item => (
                    <div key={item.id} className="item-resumen">
                      <span>{item.cantidad}x {item.nombre}</span>
                      <span>${item.precio * item.cantidad}</span>
                    </div>
                  ))}
                </div>
                <div className="total">
                  <strong>Total: ${calcularTotal(Object.values(pedidoActual))}</strong>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancelar">
                  Cancelar
                </button>
                <button type="submit" className="btn-confirmar">
                  {mesaSeleccionada ? 'Agregar Pedido' : 'Crear Mesa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelMesero;