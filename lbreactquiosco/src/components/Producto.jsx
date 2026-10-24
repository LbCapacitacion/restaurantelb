import { formatearDinero } from "../helpers"
import useQuiosco from "../hooks/useQuiosco"
import { useState } from "react"

export default function Producto({ producto, botonAgregar = false, botonDisponible = false, onAgregar }) {

    const { nombre, imagen, precio, disponible } = producto
    const { handleClickModal, handleSetProducto, handleClickProductoAgotado, handleClickProductoDisponible } = useQuiosco();
    const [src, setSrc] = useState(`/img/${imagen}.jpg`);
    return (
        <div className={`border p-3 shadow bg-white ${disponible ? '' : 'opacity-50'}`}>
            <img
                src={src}
                alt={`imagen ${producto.nombre}`}
                onError={() => setSrc(`http://localhost:8000/storage/productos/${imagen}`)}
                className="w-full object-cover h-78" />

            <div className="p-5">
                <h3 className="text-2xl font-bold">{nombre}</h3>
                <p className="mt-5 font-black text-4xl text-amber-500">{formatearDinero(precio)}</p>
                {botonAgregar && (
                    <button className="bg-indigo-600 hover:bg-indigo-800 text-white w-full mt-5 p-3 uppercase font-bold cursor-pointer"
                        type="button"
                        // onClick={() => {
                        //     handleClickModal();
                        //     handleSetProducto(producto)
                        // }}
                        onClick={onAgregar}
                    >Agregar</button>
                )}
                {
                    botonDisponible && (
                        <div className="mt-5 space-y-2">
                            {disponible ? (
                                <>
                                    <button className="bg-indigo-600 hover:bg-indigo-800 text-white w-full mt-5 p-3 uppercase font-bold cursor-pointer"
                                        type="button"
                                        onClick={() => handleClickProductoAgotado(producto.id)}
                                    >Producto Agotado</button>
                                </>
                            ) : (
                                <button className="bg-green-600 hover:bg-green-800 text-white w-full mt-5 p-3 uppercase font-bold cursor-pointer"
                                    type="button"
                                    onClick={() => handleClickProductoDisponible(producto.id)}
                                >Marcar como disponible</button>
                            )}
                        </div>

                    )
                }
            </div>
        </div>
    )
}