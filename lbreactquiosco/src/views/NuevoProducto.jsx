import { useState } from "react";
import useQuiosco from "../hooks/useQuiosco"
import clienteAxios from "../config/axios";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";


export default function NuevoProducto(){

    const {categorias} = useQuiosco();

    const [nombre, setNombre] = useState("")
    const [precio, setPrecio] = useState("")
    const [imagen, setImagen] = useState(null)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [categoriaId, setCategoriaId] = useState("")
    const [isCompressing, setIsCompressing] = useState(false);
    const navigate = useNavigate()

    const handleSubmit = async (e) =>{
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData()
        formData.append("nombre", nombre)
        formData.append("precio", precio)
        formData.append("imagen", imagen)
        formData.append("categoria_id", categoriaId)
        formData.append("disponible", 1)

        try{
            const token = localStorage.getItem("AUTH_TOKEN")

            await clienteAxios.post("/api/productos",formData,{
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                },
                withCredentials: true
            })
            setNombre("")
            setPrecio("")
            setImagen(null)
            setCategoriaId("")
            setError("")
            navigate("/admin/productos")

        }catch(error){
            setError("No se pudo crear el producto, Verifica los datos")
            console.error("Error al crear producto:", error.response?.data || error.message)
        }

    }


    const handleImageChange = async (e) => {
        const file = e.target.files[0]
        if(!file) return

        const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1200,
            useWebWorker: true
        }

        try{
            setIsCompressing(true)
            const compressedFile = await imageCompression(file, options)

            setImagen(compressedFile)
        }catch(err){
            console.error("Error al comprimir imagen:", err)
        }finally{
            setIsCompressing(false)
        }
    }

    return(
        <div className="max-w-xl mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-5">Agregar Nuevo Producto</h1>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="categoria" className="block font-bold">
                        Categoria
                    </label>
                    <select 

                        className="w-full border p-2"
                        required
                        onChange={(e) => setCategoriaId(e.target.value)}
                    >
                        <option value="" disabled selected>Selecciona una categoria</option>
                        {Array.isArray(categorias) && categorias.map(categoria =>(
                            <option value={categoria.id} key={categoria.id}>{categoria.nombre}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="nombre" className="block font-bold">Nombre:</label>
                    <input 
                        type="text"
                         value={nombre}
                        onChange={(e)=> setNombre(e.target.value)}
                        className="w-full border p-2"  
                        required  
                    />
                </div>
                <div>
                    <label htmlFor="precio" className="block font-bold">Precio:</label>
                    <input 
                        type="number"
                        value={precio}
                        onChange={(e)=> setPrecio(e.target.value)}
                        className="w-full border p-2"
                        required    
                    />
                </div>
                <div>
                    <label htmlFor="imagen" className="block font-bold">Imagen:</label>
                    <input 
                        type="file"
                        id="imagen"
                        onChange={handleImageChange}
                        className="w-full cursor-pointer"
                        accept="image/*"
                        required    
                    />
                    {isCompressing && <p className="text-sm text-blue-600 font-semibold mt-1">Optimizando imagen...</p>}
                </div>
                <button 
                    type="submit"
                    className="bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 cursor-pointer"
                    disabled={isLoading}
                   
                > {isLoading ? 'Guardando...' : 'Guardar Producto'}</button>
            </form>
            {error && <p className="text-red-600">{error}</p>}
        </div>
    )
}