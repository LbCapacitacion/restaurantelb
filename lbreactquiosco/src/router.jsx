
import { createBrowserRouter } from "react-router-dom"
import AuthLayout from "./layouts/AuthLayout"
import Login from "./views/Login"
import Registro from "./views/Registro"
import Layout from "./layouts/Layout"
import Inicio from "./views/Inicio"
import AdminLayout from "./layouts/AdminLayout"
import Ordenes from "./views/Ordenes"
import Productos from "./views/Productos"
import NuevoProducto from "./views/NuevoProducto"
import NuevaCategoria from "./views/NuevaCategoria"
import Inventario from "./components/Inventario"

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children:[
            {
                index: true,
                element: <Inicio />

            }
        ]

    },
    {
        path: '/auth',
        element: <AuthLayout />,
        children: [
            {
                path: '/auth/login',
                element: <Login />
            },
            {
                path: '/auth/registro',
                element: <Registro />
            }
        ]
    },
    {
        path: '/admin',
        element: <AdminLayout/>,
        children: [
            {
                index: true,
                element: <Ordenes />
            },
            {
                path: '/admin/productos',
                element: <Productos />
            },
            {
            path: '/admin/nuevo/producto',
            element: <NuevoProducto/>
            },
            {
                path: '/admin/nuevo/categoria',
                element: <NuevaCategoria/>
            },
            {
                path: '/admin/inventario',
                element: <Inventario/>
            }
            
        ]
    }
])

export default router