import { useState, useEffect } from "react";
import "./AgregarPlatillos.css";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import app from "../../Firebaseconfig.js";

const db = getFirestore(app);

const PanelAgregarPlatillos = ({ usuario }) => {
    const [platillos, setPlatillos] = useState([]);
    const [nombre, setNombre] = useState("");
    const [precio, setPrecio] = useState("");
    const [descripcion, setDescripcion] = useState(""); // Campo para descripción
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    // Función para agregar un platillo a la base de datos
    const handleAgregarPlatillo = async () => {
        try {
            const nuevoPlatillo = {
                nombre,
                precio,
                descripcion, // Guardamos la descripción también
            };
            await addDoc(collection(db, "platillos"), nuevoPlatillo);
            setPlatillos([...platillos, nuevoPlatillo]);
            setNombre("");
            setPrecio("");
            setDescripcion(""); // Limpiamos la descripción después de agregar
            setMostrarFormulario(false);
            console.log("Platillo agregado en Firebase", nuevoPlatillo);
        } catch (error) {
            console.error("Error al agregar el platillo: ", error);
        }
    };

    // Función para obtener todos los platillos desde la base de datos
    const obtenerPlatillos = async () => {
        try {
            const platillosSnapshot = await getDocs(collection(db, "platillos"));
            const platillosList = platillosSnapshot.docs.map(doc => doc.data());
            setPlatillos(platillosList);
        } catch (error) {
            console.error("Error al obtener los platillos: ", error);
        }
    };

    // Obtener los platillos cuando el componente se monta
    useEffect(() => {
        obtenerPlatillos();
    }, []);

    return (
        <div className={mostrarFormulario ? "blur-background" : ""}>
            <h1 className="titulo">Platillos</h1>
            <div className="boton-container">
                <button className="boton-agregar" onClick={() => setMostrarFormulario(!mostrarFormulario)}>
                    {mostrarFormulario ? "Cancelar" : "Agregar Platillo"}
                </button>
            </div>

            {/* Mostrar el formulario de agregar platillo */}
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
                            <label>Descripción (Ingredientes):</label>
                            <input
                                type="text"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit">Guardar Platillo</button>
                    </form>
                </div>
            )}

            {/* Mostrar la lista de platillos */}
            <div className="platillos-lista">
                <h2>Platillos Disponibles</h2>
                <ul>
                    {platillos.length > 0 ? (
                        platillos.map((platillo, index) => (
                            <li key={index}>
                                <h3>{platillo.nombre}</h3>
                                <p>Precio: ${platillo.precio}</p>
                                <p><strong>Descripción:</strong></p>
                                <p className="descripcion">{platillo.descripcion}</p> {/* Aquí agregamos la clase descripcion */}
                            </li>
                        ))
                    ) : (
                        <p>No hay platillos disponibles.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default PanelAgregarPlatillos;
