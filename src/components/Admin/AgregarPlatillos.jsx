import { useState, useEffect , useRef} from "react";
import "./AgregarPlatillos.css";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";
import app from "../../Firebaseconfig.js";

const db = getFirestore(app);

const PanelAgregarPlatillos = ({ usuario }) => {
    const [platillos, setPlatillos] = useState([]);
    const [nombre, setNombre] = useState("");
    const [precio, setPrecio] = useState("");
    const [descripcion, setDescripcion] = useState(""); 
    const [categoria, setCategoria] = useState(""); 
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [modoEditar, setModoEditar] = useState(false);
    const [platilloEditando, setPlatilloEditando] = useState(null);
    const formularioRef = useRef(null);

    const handleAgregarPlatillo = async () => {
        try {
            const nuevoPlatillo = {
                nombre,
                precio,
                descripcion,
                categoria,
                activo: true 
            };
            const docRef = await addDoc(collection(db, "platillos"), nuevoPlatillo);
            setPlatillos([...platillos, { ...nuevoPlatillo, id: docRef.id }]);
            setNombre("");
            setPrecio("");
            setDescripcion("");
            setCategoria("");
            setMostrarFormulario(false);
            console.log("Platillo agregado en Firebase", nuevoPlatillo);
        } catch (error) {
            console.error("Error al agregar el platillo: ", error);
        }
    };

    const abrirFormularioEdicion = (platillo) => {
        setModoEditar(true);
        setMostrarFormulario(true);
        setPlatilloEditando(platillo);
        setNombre(platillo.nombre);
        setPrecio(platillo.precio);
        setDescripcion(platillo.descripcion);
        setCategoria(platillo.categoria);
        setTimeout(() => {
            formularioRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    
    };

    const guardarEdicionPlatillo = async () => {
        try {
            const platillosSnapshot = await getDocs(collection(db, "platillos"));
            let platilloDoc = null;
    
            platillosSnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                if (data.nombre === platilloEditando.nombre) {
                    platilloDoc = docSnap;
                }
            });
    
            if (platilloDoc) {
                const platilloRef = doc(db, "platillos", platilloDoc.id);
                await updateDoc(platilloRef, {
                    nombre,
                    precio,
                    descripcion,
                    categoria,
                });
    
                setPlatillos((prevPlatillos) =>
                    prevPlatillos.map((p) =>
                        p.nombre === platilloEditando.nombre
                            ? { ...p, nombre, precio, descripcion, categoria }
                            : p
                    )
                );
    
                setModoEditar(false);
                setMostrarFormulario(false);
                setPlatilloEditando(null);
                setNombre("");
                setPrecio("");
                setDescripcion("");
                setCategoria("");
                console.log("Platillo editado");
            }
        } catch (error) {
            console.error("Error al editar platillo:", error);
        }
    };
    

    const obtenerPlatillos = async () => {
        try {
            const platillosSnapshot = await getDocs(collection(db, "platillos"));
            const platillosList = platillosSnapshot.docs.map(doc => doc.data());
            setPlatillos(platillosList);
        } catch (error) {
            console.error("Error al obtener los platillos: ", error);
        }
    };

    const desactivarPlatillo = async (nombrePlatillo) => {
        try {
            const platillosSnapshot = await getDocs(collection(db, "platillos"));
            let platilloEncontrado = null;
    
            platillosSnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                if (data.nombre === nombrePlatillo) {
                    platilloEncontrado = { id: docSnap.id, ...data };
                }
            });
    
            if (platilloEncontrado) {
                const platilloRef = doc(db, "platillos", platilloEncontrado.id);
                await updateDoc(platilloRef, { activo: false });
    
                setPlatillos((prevPlatillos) =>
                    prevPlatillos.map((p) =>
                        p.nombre === nombrePlatillo ? { ...p, activo: false } : p
                    )
                );
    
                console.log(`Platillo "${nombrePlatillo}" desactivado.`);
            } else {
                console.warn(`No se encontró el platillo: "${nombrePlatillo}".`);
            }
        } catch (error) {
            console.error("Error al desactivar platillo:", error);
        }
    };
    
    const activarPlatillo = async (nombrePlatillo) => {
        try {
            const platillosSnapshot = await getDocs(collection(db, "platillos"));
            let platilloEncontrado = null;
    
            platillosSnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                if (data.nombre === nombrePlatillo) {
                    platilloEncontrado = { id: docSnap.id, ...data };
                }
            });
    
            if (platilloEncontrado) {
                const platilloRef = doc(db, "platillos", platilloEncontrado.id);
                await updateDoc(platilloRef, { activo: true });
    
                setPlatillos((prevPlatillos) =>
                    prevPlatillos.map((p) =>
                        p.nombre === nombrePlatillo ? { ...p, activo: true } : p
                    )
                );
    
                console.log(`Platillo "${nombrePlatillo}" activado.`);
            } else {
                console.warn(`No se encontró el platillo: "${nombrePlatillo}".`);
            }
        } catch (error) {
            console.error("Error al activar platillo:", error);
        }
    };
    
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

            {mostrarFormulario && (
                <div className="modal">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (modoEditar) {
                                guardarEdicionPlatillo();
                            } else {
                                handleAgregarPlatillo();
                            }
                        }}
                        className="platillo-form" ref={formularioRef}
                    >
                        <div>
                            <label>Nombre:</label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                className="nombre-input"
                            />
                        </div>
                        <div>
                            <label>Precio:</label>
                            <input
                                type="number"
                                value={precio}
                                onChange={(e) => setPrecio(e.target.value)}
                                required
                                className="precio-input"
                            />
                        </div>
                        <div>
                            <label>Descripción (Ingredientes):</label>
                            <input
                                type="text"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                required
                                className="descripcion-input"
                            />
                        </div>
                        <div>
                            <label>Categoria:</label>
                            <input 
                                type="text"
                                value={categoria}
                                onChange={(e) => setCategoria(e.target.value)}
                                required
                                className="categoria-input"
                            />
                        </div>
                        <button type="submit">Guardar Platillo</button>
                    </form>
                </div>
            )}

            <h2 className="titulo">Platillos Disponibles</h2>
            <div className="platillos-lista">
                <ul>
                    {platillos.length > 0 ? (
                        platillos.map((platillo, index) => (
                            <li key={index}>
                                <h3>{platillo.nombre}</h3>
                                <p><strong>Precio:</strong> {platillo.precio}$</p>
                                <p><strong>Descripción:</strong></p>
                                <p className="descripcion">{platillo.descripcion}</p>
                                <p><strong>Categoria:</strong> {platillo.categoria}</p>
                                
                                <div className="botones-acciones">
                                     {platillo.activo ? (
                                         <button
                                             className="boton-desactivar"
                                             onClick={() => desactivarPlatillo(platillo.nombre)}
                                         >
                                             Desactivar
                                         </button>
                                     ) : (
                                         <button
                                             className="boton-activar"
                                             onClick={() => activarPlatillo(platillo.nombre)}
                                         >
                                             Activar
                                         </button>
                                     )}
                                     <button
                                     className="boton-editar"
                                     onClick={() => abrirFormularioEdicion(platillo)}
                                 >Editar </button>
                                 </div>
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