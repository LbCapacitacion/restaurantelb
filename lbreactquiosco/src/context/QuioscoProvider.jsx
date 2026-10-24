import { createContext, useState, useEffect } from "react";
import clienteAxios from "../config/axios";
import { toast } from "react-toastify";
import { mutate } from "swr";

const QuioscoContext = createContext();

const QuioscoProvider = ({ children }) => {
    const [categorias, setCategorias] = useState([]);
    const [categoriaActual, setCategoriaActual] = useState({});
    const [modal, setModal] = useState(false);
    const [producto, setProducto] = useState({});
    const [pedido, setPedido] = useState([]);
    const [total, setTotal] = useState(0)

    useEffect(() => {
        const nuevoTotal = pedido.reduce((total, producto) => (producto.precio * producto.cantidad) + total, 0)
        setTotal(nuevoTotal)
    }, [pedido])

    const obtenerCategorias = async () => {
        try {
            const { data } = await clienteAxios('/api/categorias')
            //console.log(data)
            setCategorias(data.data)
            setCategoriaActual(data.data[0])
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {

        obtenerCategorias();
    }, [])

    const handleClickCategoria = id => {
        const categoria = categorias.filter(categoria => categoria.id === id)[0]
        setCategoriaActual(categoria)
        // console.log(categoria)
    }
    const handleClickModal = () => {
        setModal(!modal)
    }

    const handleSetProducto = producto => {
        setProducto(producto);
    }
    const handleAgregarPedido = ({ categoria_id, ...producto }) => {
        if (pedido.some(pedidoState => pedidoState.id === producto.id)) {
            const pedidoActualizado = pedido.map(pedidoState => pedidoState.id === producto.id ? producto : pedidoState)
            setPedido(pedidoActualizado)
            console.log(pedido)
            toast.success('Guardado correctamente')

        } else {
            setPedido([...pedido, producto])
            //console.log(pedido)
            toast.success('Agregado al pedido')
        }
    }

    const handleEditarCantidad = id => {
        const productoActualizar = pedido.filter(producto => producto.id === id)[0]
        setProducto(productoActualizar)
        setModal(!modal)
    }

    const handleEliminarProductoPedido = id => {
        const pedidoActualizado = pedido.filter(producto => producto.id !== id)
        setPedido(pedidoActualizado)
        toast.error('Eliminado del pedido')
    }

    const handleSubmitNuevaOrden = async () => {
        const token = localStorage.getItem('AUTH_TOKEN')

        try {
            const { data } = await clienteAxios.post('/api/pedidos',
                {
                    total,
                    productos: pedido.map(producto => {
                        return {
                            id: producto.id,
                            cantidad: producto.cantidad
                        }
                    })
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            setPedido([]);
            setTotal(0);
            toast.success(data.message)


        } catch (error) {
            console.log(error)
        }
    }

    const handleClickCompletarPedido = async id => {
        const token = localStorage.getItem('AUTH_TOKEN')

        try {
            await clienteAxios.put(`/api/pedidos/${id}`, null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        } catch (error) {
            console.log(error)
        }
    }

    const handleClickProductoAgotado = async id => {
        //const token = localStorage.getItem('AUTH_TOKEN')
        try {
            await clienteAxios.put(`/api/productos/${id}/agotado`, {})

            mutate('/api/productos')
            toast.info('Producto marcado como agotado')
        } catch (error) {
            console.log('Error al marcar como agotado', error)
        }
    }

    const handleClickProductoDisponible = async id => {
        try{
            await clienteAxios.put(`/api/productos/${id}/disponible`, {})

            mutate('/api/productos')
            toast.success('Producto disponible nuevamente')
            
        }catch(error){
            console.error('Error al marcar como disponible', error)
        }
    }

    


    return (
        <QuioscoContext.Provider
            value={{
                categorias,
                categoriaActual,
                handleClickCategoria,
                handleClickModal,
                modal,
                producto,
                handleSetProducto,
                handleAgregarPedido,
                pedido,
                handleEditarCantidad,
                handleEliminarProductoPedido,
                total,
                handleSubmitNuevaOrden,
                handleClickCompletarPedido,
                handleClickProductoAgotado,
                handleClickProductoDisponible,
                

            }}
        >
            {children}
        </QuioscoContext.Provider>
    )


}

export {
    QuioscoProvider
}
export default QuioscoContext