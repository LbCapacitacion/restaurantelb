import { useEffect, useState } from "react";
import clienteAxios from "../config/axios";
import useQuiosco from "../hooks/useQuiosco";



export default function Inventario() {
    const [productos, setProductos] = useState([])
    //const {handleVaciarStock} = useQuiosco()
    // const {imagen} = productos
    //const [src, setSrc] = useState(`/img/${imagen}.jpg`);

    useEffect(() => {
        const fetchInventario = async () => {
            try {
                const token = localStorage.getItem("AUTH_TOKEN")
                const { data } = await clienteAxios.get("/api/productos", {
                    headers: { Authorization: `Bearer ${token}` }
                })
                console.log("Respuesta API:", data)
                setProductos(data.data || [])
            } catch (error) {
                console.log("Error al cargar inventario:", error)
                setProductos([])
            }
        }
        fetchInventario()
    }, [])

    const recargarStock = async (id) => {
        const cantidad = prompt("¿Cauntas unidades deseas recargar?")
        if (!cantidad) return

        const token = localStorage.getItem("AUTH_TOKEN")

        const resp = await clienteAxios.put(`/api/productos/${id}/recargar-stock`,
            { cantidad },
            { headers: { Authorization: `Bearer ${token}` } }
        )

        const productoActualizado = resp.data.producto

        //referescar lista

        setProductos(prevProductos => prevProductos.map(p => p.id === id ? { ...p, stock: productoActualizado.stock } : p))
    }

    const handleVaciarStock = async (id) => {
        if (!confirm("¿Estas seguro de continuar... el stock volvera a 0?")) return

        try {
            const token = localStorage.getItem("AUTH_TOKEN")

            await clienteAxios.put(`/api/productos/${id}/vaciar-stock`, {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            setProductos((productosPrevios) =>
                productosPrevios.map((producto) =>
                    producto.id === id ? { ...producto, stock: 0 } : producto
                )
            );
        } catch (error) {
            console.error("Error al vaciar el stock", error.response?.data || error.message)
        }
    }


    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold py-3">Inventario</h1>
            <table className="w-full border-collapse border border-gray-300 text-center">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border p-2">Imagen</th>
                        <th className="border p-2">Nombre</th>
                        <th className="border p-2">Precio</th>
                        <th className="border p-2">Stock</th>
                        <th className="border p-2">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {productos.map(prod => (
                        <tr key={prod.id}>
                            <td className="border p-2">
                                {prod.imagen ? (
                                    <img

                                        alt={`imagen ${prod.nombre}`}
                                        src={`http://localhost:8000/storage/productos/${prod.imagen}`}
                                        className="w-16 h-16 object-cover rounded" />
                                ) : (
                                    <span className="text-gray-400">Sin imagen</span>
                                )}
                            </td>
                            <td className="border p-2">{prod.nombre}</td>
                            <td className="border p-2">${prod.precio}</td>
                            <td className={`border p-2 ${prod.stock < 5 ? "bg-red-100 text-red-600" : ""}`}>{prod.stock}</td>
                            <td className="border p-2">
                                <button
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 mr-3 mb-2 rounded cursor-pointer"
                                    onClick={() => recargarStock(prod.id)}
                                >Recargar Stock</button>
                                <button
                                    type="button"
                                    onClick={() => handleVaciarStock(prod.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded cursor-pointer"
                                >Vaciar Stock</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}