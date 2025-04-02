import { useState } from "react";
import "./AgregarPlatillos.css";

const PanelAgregarPlatillos = ({ usuario }) => {
    const [platillos, setPlatillos] = useState([]);
    const [nombre, setNombre] = useState("");
    const [precio, setPrecio] = useState("");
    const [imagen, setImagen] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const handleAgregarPlatillo = () => {
        const nuevoPlatillo = {
            nombre,
            precio,
            imagen,
        };
        setPlatillos([...platillos, nuevoPlatillo]);
        setNombre("");
        setPrecio("");
        setImagen(null);
        setMostrarFormulario(false);
        console.log("Platillo agregado", nuevoPlatillo);
    };

    const handleImagenSeleccionada = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImagen(URL.createObjectURL(file));
        }
    };

    return (
        <div className={mostrarFormulario ? "blur-background" : ""}>
            <h1 className="titulo">Platillos</h1>
            <div className="boton-container">
                <button className="boton-agregar" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
                    {mostrarFormulario ? "Cancelar" : "Agregar Platillo"}
                </button>
            </div>
            {mostrarFormulario && (
                <div className="modal">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleAgregarPlatillo();
                        }}
                        className="platillo-form"
                    >
                        <div>
                            <label>Nombre:</label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label>Precio:</label>
                            <input
                                type="number"
                                value={precio}
                                onChange={(e) => setPrecio(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label>Imagen:</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImagenSeleccionada}
                            />
                        </div>
                        {imagen && <img src={imagen} alt="Vista previa" className="preview-image" />}
                        <button type="submit">Guardar Platillo</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PanelAgregarPlatillos;
