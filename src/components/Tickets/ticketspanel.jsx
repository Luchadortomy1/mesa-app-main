import React, { useState, useEffect } from 'react';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import app from '../../Firebaseconfig';
import './TicketsPanel.css';

const TicketsPanel = () => {
  const db = getFirestore(app);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar tickets desde Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tickets'), (querySnapshot) => {
      const ticketsData = [];
      querySnapshot.forEach((doc) => {
        ticketsData.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setTickets(ticketsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  if (loading) {
    return <div className="tickets-panel">Cargando tickets...</div>;
  }

  return (
    <div className="tickets-panel">
      <header className="tickets-header">
        <h2>Tickets Generados</h2>
      </header>
      
      <div className="tickets-container">
        {tickets.length === 0 ? (
          <div>No hay tickets disponibles.</div>
        ) : (
          tickets.map(ticket => (
            <div key={ticket.id} className="ticket-card">
              <div className="ticket-header">
                <h3>Mesa {ticket.numeroMesa}</h3>
                <span className={`ticket-status ${ticket.estado}`}>
                  {ticket.estado.charAt(0).toUpperCase() + ticket.estado.slice(1)}
                </span>
              </div>

              <div className="ticket-items">
                <h4>Items:</h4>
                <ul>
                  {ticket.items.map((item, index) => (
                    <li key={index}>
                      {item.cantidad}x {item.nombre}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="ticket-footer">
                <span><strong>Total: </strong>{ticket.total}</span>
                <span><strong>Cliente: </strong>{ticket.nombreCliente}</span>
                <span><strong>Fecha: </strong>{new Date(ticket.fechaCreacion.seconds * 1000).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TicketsPanel;
