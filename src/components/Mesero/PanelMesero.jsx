import React, { useState, useEffect } from 'react';
import './PanelMesero.css';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';
import 'jspdf-autotable';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  onSnapshot,
  updateDoc, 
  doc 
} from 'firebase/firestore';
import app from '../../Firebaseconfig';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const PanelMesero = ({usuario}) => {
  const db = getFirestore(app);
  const [mesas, setMesas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [nuevaMesa, setNuevaMesa] = useState({
    nombreCliente: '',
    numeroComensales: 1,
    comentario: ''
  });
  const [pedidoActual, setPedidoActual] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);

  // Cargar menú desde Firestore
  useEffect(() => {
    const q = query(collection(db, 'mesas'), where('estado', '==', 'activa'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const mesasData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMesas(mesasData);
    }, (error) => {
      console.error("Error al escuchar cambios de mesas:", error);
    });
  
    return () => unsubscribe();
  }, [db]);

  const data = Cookies.get('token');
  const datauser = JSON.parse(data);
  if (datauser?.role !== 'mesero') {
    return <Navigate to="/" replace />;
  }
  
  // Cargar mesas activas desde Firestore
  useEffect(() => {
    const q = query(collection(db, 'platillos'), where('activo', '==', true));
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        categoria: doc.data().categoria || 'Otros'
      }));
      setMenuItems(items);
      setLoadingMenu(false);
    }, (error) => {
      console.error("Error al escuchar cambios en el menú:", error);
      setLoadingMenu(false);
    });
  
    return () => unsubscribe();
  }, [db]);
  

  const agregarMesa = () => {
    const mesasActivas = mesas.filter(m => m.estado === 'activa');
    if (mesasActivas.length >= 7) {
      Swal.fire({
        title: 'Mesas llenas',
        text: 'Ya no hay mesas disponibles. El máximo es 7.',
        icon: 'warning',
        confirmButtonColor: '#007bdd',
        background: '#1e1e1e',
        color: '#ffffff'
      });
      return;
    }
    setMesaSeleccionada(null);
    setShowModal(true);
    setPedidoActual({});
  };
  

  const calcularTotal = (pedidos) => {
    return pedidos.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const guardarPedido = async (mesaData) => {
    try {
      const itemsArray = Object.values(pedidoActual);
      
      if (itemsArray.length === 0) {
        throw new Error("No hay items en el pedido");
      }

      const numeroMesa = mesaData?.numero || (mesas.length > 0 ? Math.max(...mesas.map(m => m.numero)) + 1 : 1);
      const nombreCliente = mesaData?.cliente || nuevaMesa.nombreCliente || 'Cliente no especificado';

      const pedidoData = {
        numeroMesa: numeroMesa,
        nombreCliente: nombreCliente,
        items: itemsArray.map(item => ({
          id: item.id || Date.now().toString(),
          nombre: item.nombre || 'Producto sin nombre',
          precio: item.precio || 0,
          cantidad: item.cantidad || 1,
          estado: 'pendiente',
        })),
        total: calcularTotal(itemsArray),
        estado: 'pendiente',
        comentario: mesaData.comentario || nuevaMesa.comentario || '',
        fecha: serverTimestamp()
      };

      await addDoc(collection(db, 'pedidos'), pedidoData);

      if (mesaSeleccionada) {
        await updateDoc(doc(db, 'mesas', mesaSeleccionada.id), {
          pedidos: [...mesaSeleccionada.pedidos, ...itemsArray],
          total: calcularTotal([...mesaSeleccionada.pedidos, ...itemsArray]),
          estado: 'activa'
        });
      } else {
        await addDoc(collection(db, 'mesas'), {
          numero: numeroMesa,
          cliente: nombreCliente,
          comensales: nuevaMesa.numeroComensales || 1,
          pedidos: itemsArray,
          total: calcularTotal(itemsArray),
          estado: 'activa',
          fechaCreacion: serverTimestamp(),
          comentario: nuevaMesa.comentario || ''
        });
      }

      return true;
    } catch (error) {
      console.error("Error al guardar pedido:", error);
      Swal.fire({
        title: 'Error',
        text: `Error al guardar: ${error.message}`,
        icon: 'error',
        background: '#1e1e1e',
        color: '#ffffff',
        confirmButtonColor: '#007bdd'
      });
      return false;
    }
  };

  const handleSubmitMesa = async (e) => {
    e.preventDefault();
    
    if (Object.keys(pedidoActual).length === 0) {
      Swal.fire({
        title: 'Pedido vacío',
        text: 'Debes agregar al menos un platillo antes de enviar la orden.',
        icon: 'error',
        background: '#1e1e1e',
        color: '#ffffff',
        confirmButtonColor: '#007bdd'
      });
      return;
    }
  
    if (nuevaMesa.numeroComensales > 20) {
      Swal.fire({
        title: 'Error',
        text: 'No se pueden agregar más de 20 comensales.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        background: '#1e1e1e',
        color: '#ffffff',
        confirmButtonColor: '#007bdd',
      });
      return;
    }
  
    const success = await guardarPedido(mesaSeleccionada || {
      numero: mesas.length > 0 ? Math.max(...mesas.map(m => m.numero)) + 1 : 1,
      cliente: nuevaMesa.nombreCliente
    });
  
    if (success) {
      setShowModal(false);
      setNuevaMesa({ nombreCliente: '', numeroComensales: 1 });
      setPedidoActual({});
      setMesaSeleccionada(null);
      
      Swal.fire({
        title: 'Éxito',
        text: mesaSeleccionada ? 'Pedido agregado correctamente' : 'Mesa creada correctamente',
        icon: 'success',
        background: '#1e1e1e',
        color: '#ffffff',
        confirmButtonColor: '#007bdd'
      });

      const q = query(collection(db, 'mesas'), where('estado', '==', 'activa'));
      const querySnapshot = await getDocs(q);
      setMesas(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
  };
  

  const actualizarCantidad = (itemId, cantidad) => {
    if (cantidad < 0) return;

    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    if (cantidad === 0) {
      const { [itemId]: _, ...resto } = pedidoActual;
      setPedidoActual(resto);
    } else {
      setPedidoActual({
        ...pedidoActual,
        [itemId]: { 
          ...item, 
          cantidad,
          precio: item.precio || 0,
          nombre: item.nombre || 'Producto sin nombre'
        }
      });
    }
  };

  const agregarPedidoAMesa = (mesa) => {
    setMesaSeleccionada(mesa);
    setShowModal(true);
    setPedidoActual({});
  };

  const generarCuenta = async (mesa) => {
    const { isConfirmed } = await Swal.fire({
      title: '¿Cerrar cuenta?',
      text: 'Esto marcará la mesa como completada.',
      icon: 'warning',
      background: '#1e1e1e',
      color: '#ffffff',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#007bdd',
      cancelButtonColor: '#6b7280',
    });
  
    if (!isConfirmed) return;
  
    const { value: metodoPago } = await Swal.fire({
      title: "Método de pago",
      input: "select",
      inputOptions: {
        efectivo: "Efectivo",
        tarjeta: "Tarjeta",
        transferencia: "Transferencia"
      },
      inputPlaceholder: "Selecciona el método de pago",
      showCancelButton: true,
      background: '#1e1e1e',
      color: '#ffffff',
      inputValidator: (value) => {
        if (!value) return "Debes seleccionar un método de pago";
      }
    });
  
    if (!metodoPago) return;
  
    const { value: accion } = await Swal.fire({
      title: "Nota de venta",
      text: "¿Cómo deseas generar la nota de venta?",
      input: "select",
      inputOptions: {
        imprimir: "Imprimir nota",
        mostrar: "Mostrar en pantalla",
        ambas: "Ambas opciones"
      },
      inputPlaceholder: "Selecciona una opción",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Continuar",
      confirmButtonColor: '#007bdd',
      background: '#1e1e1e',
      color: '#ffffff'
    });
  
    if (!accion) return;
  
    try {
      await updateDoc(doc(db, 'mesas', mesa.id), {
        estado: 'completada',
        fechaCierre: serverTimestamp(),
        metodoPago
      });
  
      setMesas(mesas.map(m => m.id === mesa.id ? { ...m, estado: 'completada', metodoPago } : m));
  
      const docPDF = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200]
      });

      // Configuración inicial
      docPDF.setFont('helvetica', 'normal');
      docPDF.setFontSize(10);

      // Encabezado
      docPDF.setTextColor(0, 0, 0);
      docPDF.setFontSize(14);
      docPDF.text("RESTAURANTE DELICIAS", 40, 10, { align: 'center' });
      
      docPDF.setFontSize(10);
      docPDF.text("Dirección: Av. Principal 123", 40, 16, { align: 'center' });
      docPDF.text("Tel: 555-123-4567", 40, 20, { align: 'center' });
      docPDF.text("RFC: ABCD123456XYZ", 40, 24, { align: 'center' });

      // Línea divisoria
      docPDF.line(5, 28, 75, 28);

      // Datos del ticket
      docPDF.setFontSize(12);
      docPDF.text(`TICKET #${Math.floor(Math.random() * 10000)}`, 40, 34, { align: 'center' });
      
      const fecha = new Date();
      docPDF.text(`Fecha: ${fecha.toLocaleDateString()}`, 5, 40);
      docPDF.text(`Hora: ${fecha.toLocaleTimeString()}`, 5, 45);
      
      docPDF.text(`Mesa: ${mesa.numero}`, 5, 50);
      docPDF.text(`Cliente: ${mesa.cliente}`, 5, 55);
      docPDF.text(`Comensales: ${mesa.comensales}`, 5, 60);
      
      // Línea divisoria
      docPDF.line(5, 64, 75, 64);

      // Detalle de productos
      docPDF.setFontSize(10);
      docPDF.text("CANT DESCRIPCIÓN       IMPORTE", 5, 70);
      
      let y = 75;
      mesa.pedidos.forEach(item => {
        const descripcion = item.nombre.length > 20 ? item.nombre.substring(0, 17) + '...' : item.nombre;
        const importe = (item.precio * item.cantidad).toFixed(2);
        
        docPDF.text(`${item.cantidad}`, 5, y);
        docPDF.text(`${descripcion}`, 15, y);
        docPDF.text(`$${importe}`, 65, y, { align: 'right' });
        y += 5;
      });

      // Línea divisoria
      docPDF.line(5, y, 75, y);
      y += 5;

      // Totales
      const subtotal = mesa.pedidos.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
      const iva = subtotal * 0.16;
      const total = subtotal + iva;

      docPDF.text(`Subtotal: $${subtotal.toFixed(2)}`, 55, y, { align: 'right' });
      y += 5;
      docPDF.text(`IVA (16%): $${iva.toFixed(2)}`, 55, y, { align: 'right' });
      y += 5;
      docPDF.setFont('helvetica', 'bold');
      docPDF.text(`TOTAL: $${total.toFixed(2)}`, 55, y, { align: 'right' });
      y += 5;
      
      docPDF.setFont('helvetica', 'normal');
      docPDF.text(`Método de pago: ${metodoPago.toUpperCase()}`, 5, y);
      y += 5;
      
      if (mesa.comentario) {
        docPDF.text(`Comentario: ${mesa.comentario}`, 5, y);
        y += 5;
      }

      // Pie de página
      docPDF.line(5, y, 75, y);
      y += 5;
      docPDF.setFontSize(8);
      docPDF.text("¡Gracias por su visita!", 40, y, { align: 'center' });
      y += 5;
      docPDF.text("Vuelva pronto", 40, y, { align: 'center' });

      // Mostrar/Imprimir según selección
      if (accion === 'mostrar' || accion === 'ambas') {
        const pdfDataUri = docPDF.output('datauristring');
        Swal.fire({
          title: 'Nota de venta',
          html: `<iframe src="${pdfDataUri}" style="width:100%; height:400px; border:none;"></iframe>`,
          showConfirmButton: true,
          confirmButtonText: 'Cerrar',
          width: '80%',
          background: '#1e1e1e',
          customClass: {
            popup: 'pdf-viewer-popup'
          }
        });
      }

      if (accion === 'imprimir' || accion === 'ambas') {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head>
              <title>Nota de venta - Mesa ${mesa.numero}</title>
              <style>
                body { margin: 0; padding: 0; }
                @media print {
                  @page { size: auto; margin: 0mm; }
                }
              </style>
            </head>
            <body>
              <embed 
                width="100%" 
                height="100%" 
                src="${docPDF.output('datauristring')}" 
                type="application/pdf"
              />
              <script>
                setTimeout(() => {
                  document.querySelector('embed').addEventListener('load', () => {
                    window.print();
                    setTimeout(() => window.close(), 1000);
                  });
                }, 500);
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }

    } catch (error) {
      console.error("Error al generar cuenta:", error);
      Swal.fire({
        title: "Error",
        text: "Ocurrió un error al generar la cuenta",
        icon: "error",
        background: '#1e1e1e',
        color: '#ffffff'
      });
    }
  };

  const agruparPorCategoria = (items) => {
    return items.reduce((acc, item) => {
      const categoria = item.categoria || 'Otros';
      if (!acc[categoria]) acc[categoria] = [];
      acc[categoria].push(item);
      return acc;
    }, {});
  };

  if (loadingMenu) {
    return <div className="panel-mesero">Cargando menú...</div>;
  }

  return (
    <div className="panel-mesero">
      <header>
        <div className="header-content">
          <h2>Agregue su pedido</h2>
        </div>
      </header>

      <div className="dashboard">
        <div className="stats-bar">
          <div className="stat-item">
            <h4>Mesas Activas</h4>
            <p>{mesas.length}</p>
          </div>
          <div className="stat-item">
            <h4>Por Cobrar</h4>
            <p>{mesas.filter(m => m.estado === 'activa').length}</p>
          </div>
        </div>

        <section className="mesas-container">
          <h3>Mis Mesas</h3>
          <div className="mesas-grid">
            <button className="btn-agregar" onClick={agregarMesa}>
              <span className="btn-icon">+</span>
            </button>

            {mesas.map((mesa) => (
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
                  <p>Comentario: {mesa.comentario}</p>
                </div>
                <div className="mesa-actions">
                  <button 
                    className="btn-menu" 
                    onClick={() => agregarPedidoAMesa(mesa)} 
                    disabled={mesa.estado === 'completada'}
                  >
                    <span className="icon">📋</span>
                    <span>Menú</span>
                  </button>
                  <button 
                    className="btn-cuenta" 
                    onClick={() => generarCuenta(mesa)} 
                    disabled={mesa.estado === 'completada'}
                  >
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
                      onChange={(e) => setNuevaMesa({ ...nuevaMesa, numeroComensales: parseInt(e.target.value) || 1 })}
                      required
                    />
                    <label>Comentario</label>
                    <input
                      type="text"
                      value={nuevaMesa.comentario}
                      onChange={(e) => setNuevaMesa({ ...nuevaMesa, comentario: e.target.value })}
                      placeholder="Opcional"
                    />
                  </div>
                </>
              )}

              <div className="menu-section">
                <h3>Menú</h3>
                <div className="comentario-pedido">
                  <label><strong>Comentario del Pedido:</strong></label>
                  <p>{nuevaMesa.comentario || mesaSeleccionada?.comentario || 'Sin comentario'}</p>
                </div>
                {Object.entries(agruparPorCategoria(menuItems)).map(([categoria, items]) => (
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