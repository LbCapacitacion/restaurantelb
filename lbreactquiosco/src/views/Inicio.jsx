
import useSWR from "swr"
import Producto from "../components/Producto"
import clienteAxios from "../config/axios"
import useQuiosco from "../hooks/useQuiosco"
import { useEffect, useState } from "react"
import Resumen from '../components/Resumen'
import Modal from 'react-modal'
import ModalProducto from '../components/ModalProducto'
import { toast } from "react-toastify"


export default function Inicio() {



    const { categoriaActual } = useQuiosco()
    const token = localStorage.getItem('AUTH_TOKEN')
    const fetcher = () => clienteAxios('/api/productos', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(data => data.data)

    const { data, error, isLoading } = useSWR('/api/productos', fetcher, {
        refreshInterval: 1000
    })
    const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
    //const {handleClickModal, handleSetProducto} = useQuiosco();

    const [pedidosPorMesa, setPedidosPorMesa] = useState(() => {
        const guardados = localStorage.getItem('pedidosPorMesa')
        return guardados ? JSON.parse(guardados) : {}

    });
 
    const [mostrarModal, setMostrarModal] = useState(false)

    const [productoModal, setProductoModal] = useState(null)
    const [cantidadModal, setCantidadModal] = useState(1)
    const [edicionModal, setEdicionModal] = useState(false)


    useEffect(() => {
        localStorage.setItem('pedidosPorMesa', JSON.stringify(pedidosPorMesa))
    }, [pedidosPorMesa])

    // console.log(data)
    // console.log(error)
    // console.log(isLoading)

    if (isLoading || !categoriaActual?.id) return 'Cargando...';

    //const productos = data?.data || [] //encademiento opcional

    const productos = data?.data?.filter(producto => producto.categoria_id === categoriaActual.id && producto.disponible === 1) || [] 

    //console.log(productos)
    //console.log("Productos:", data);

    const enviarPedido = async (mesa) => {
        const token = localStorage.getItem('AUTH_TOKEN');
        const productos = pedidosPorMesa[mesa]

        //const productos = 

        try {
            await clienteAxios.post('/api/pedidos', {
                mesa,
                productos: pedidosPorMesa[mesa],
                total: pedidosPorMesa[mesa].reduce((acc,p) => acc + p.precio * p.cantidad,0)
                //total: 
            },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
             toast.success(`Pedido de mesa ${mesa} enviado con exito`)

             setPedidosPorMesa(prev => ({...prev, [mesa]: []}))

        } catch (error) {
            console.error(error);
             toast.error('Error al enviar el pedido')
        }
    }

    Modal.setAppElement('#root')

    return (
        <div className="md:flex h-screen">
            <div className="flex-1 overflow-y-scroll">
                <h1 className="text-4xl font-black">Productos</h1>
                <p className="text-2xl my-10">Elige y personaliza tu pedido a continuación</p>

                {/* Selector de mesa */}
                <div className="mb-4">
                    <label className="text-lg font-semibold">Selecciona la mesa:</label>
                    <select
                        className="ml-2 p-2 border rounded"
                        value={mesaSeleccionada || ''}
                        onChange={(e) => {
                            const mesa = e.target.value
                            setMesaSeleccionada(mesa)
                            if (!pedidosPorMesa[mesa]) {
                                setPedidosPorMesa(prev => ({ ...prev, [mesa]: [] }))

                            }

                        }}
                    >
                        <option value="">--Mesa--</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(num => (
                            <option key={num} value={`Mesa ${num}`}>{`Mesa ${num}`}</option>
                        ))}

                    </select>
                </div>

                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                    {productos.map(producto => {
                        return (
                            <Producto
                                key={producto.imagen}
                                producto={producto}
                                botonAgregar={true}
                                onAgregar={() => {
                                    if (!mesaSeleccionada) {
                                        alert('Seleccione una mesa primero')
                                        return

                                    }
                                    // handleClickModal(),
                                    //handleSetProducto(producto)
                                    setProductoModal(producto)
                                    setMostrarModal(true)
                                    setCantidadModal(1)
                                    //setEdicionModal()
                                }}
                            />
                        )
                    })}

                </div>
            </div>
            <Resumen
                mesaSeleccionada={mesaSeleccionada}
                pedidosPorMesa={pedidosPorMesa}
                setPedidosPorMesa={setPedidosPorMesa}
                onEditarProducto={(producto) =>{
                    setProductoModal(producto)
                    setCantidadModal(producto.cantidad)
                    setEdicionModal(true)
                    setMostrarModal(true)
                }}
                onEliminarProducto={(id) =>{
                    setPedidosPorMesa(prev =>{
                        const pedidoMesa = prev[mesaSeleccionada] || []
                        const nuevoPedido = pedidoMesa.filter(p => p.id !== id)
                        return {
                            ...prev,
                            [mesaSeleccionada]: nuevoPedido
                        }
                    })
                }}
                enviarPedido={enviarPedido}
            />

            {mostrarModal && productoModal && (
                <Modal
                    isOpen={mostrarModal}
                    onRequesClose={() => setMostrarModal(false)}
                    style={
                        {
                            content: {
                                top: '50%',
                                left: '50%',
                                right: 'auto',
                                bottom: 'auto',
                                marginRight: '-50%',
                                transform: 'translate(-50%, -50%)',
                                padding: '2rem',
                                borderRadius: '0.5rem',
                                width: '90%',
                                maxWidth: '600px',
                            },
                            overlay: {
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                zIndex: 1000,
                            },
                        }
                    }

                >
                    <ModalProducto
                        producto={productoModal}
                        cantidadInicial={cantidadModal}
                        edicion={edicionModal}
                        onClose={() => setMostrarModal(false)}
                        onConfirm={(productoConCantidad) => {
                            setPedidosPorMesa(prev => {
                                const pedidoMesa = prev[mesaSeleccionada] || [];
                                const existe = pedidoMesa.find(p => p.id === productoConCantidad.id)

                                const nuevoPedido = existe
                                    ? pedidoMesa.map(p =>
                                        p.id === productoConCantidad.id ? productoConCantidad : p
                                    )
                                    : [...pedidoMesa, productoConCantidad]
                                return {
                                    ...prev,
                                    [mesaSeleccionada]: nuevoPedido
                                }
                            })
                            setMostrarModal(false)
                            toast.success('Agregado correctamente')
                            
                        }}
                    />
                </Modal>
            )}
        </div>
    )
}