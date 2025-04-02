// src/components/Common/Modal.jsx
import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{title}</h3>
          <button 
            className="modal-close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
        <div className="modal-footer">
          <button 
            className="modal-button modal-button-secondary"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;