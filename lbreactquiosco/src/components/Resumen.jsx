import { useState } from "react";
import { formatearDinero } from "../helpers"
import useQuiosco from "../hooks/useQuiosco"
import ResumenProducto from "./ResumenProducto";
import { toast } from "react-toastify";

export default function Resumen(
    {

        mesaSeleccionada,
        pedidosPorMesa,
        onEditarProducto,
        onEliminarProducto,
        enviarPedido
        

    }
) {
    
    const [cargandoEnvio, setCargandoEnvio] = useState(false);
    const pedido = mesaSeleccionada ? pedidosPorMesa[mesaSeleccionada] || [] : []
    const total = pedido.reduce((acc, producto) => acc + producto.precio * producto.cantidad,0)

    if(pedido.length === 0){
        console.log("no hay pedidos aun")
    }else{
        console.log("ya hay algo")
         console.log(pedido)
    }
   
    

    const handleSubmit = async e =>{
        e.preventDefault();

        if(cargandoEnvio) return;

        setCargandoEnvio(true);

        await enviarPedido(mesaSeleccionada);

       

        setCargandoEnvio(false);

        
    }

    return (
        <aside className="w-80 p-5 overflow-y-scroll h-screen p-4 bg-white shadow-lg">
            <h1 className="text-4xl font-black">Pedido</h1>
            <p className="text-lg my-5">
                {mesaSeleccionada ? `Resumen de ${mesaSeleccionada}`: 'Selecciona una mesa para ver el pedido'}
            </p>
            
            <div className="py-10">
                {
                    (
                        pedido.map(producto => (
                            <ResumenProducto 
                                key={producto.id}
                                producto={producto}
                                onEditar={()=> onEditarProducto(producto)}
                                onEliminar={()=> {
                                    onEliminarProducto(producto.id)
                                    toast.error('Eliminado del pedido')
                                }}
                            />
                        ))
                    ) 
                }

            </div>
            <p className="text-xl mt-10">
                Total: {formatearDinero(total)}
            </p>
            <form className="w-full" onSubmit={handleSubmit}>
                <div className="mt-5">
                    <input type="submit" 
                        className={`${pedido.length === 0 || cargandoEnvio ? 'bg-indigo-100' : 'bg-indigo-600 hover:bg-indigo-800'} px-5 py-2 rounded uppercase font-bold text-white text-center w-full  ${pedido.length === 0 || cargandoEnvio ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        value={cargandoEnvio ? "Procesando..." : "Confirmar Pedido"}// Mostrar estado de carga
                        disabled={pedido.length === 0 || cargandoEnvio}
                    />
                </div>
            </form>
        </aside>
    )
}