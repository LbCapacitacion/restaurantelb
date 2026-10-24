import {useAuth} from "../hooks/useAuth";
import { Link } from "react-router-dom";

export default function AdminSidebar()
{
    const {logout, user} = useAuth({middleware: 'auth'})

    return (
        <aside className="md:w-72 h-screen">
            <div className="p-4">
                <img src="/img/logo.svg" alt="imagen logo" className="w-50" />

            </div>
            <p className="my-10 text-xl text-center">Hola: {user?.name}</p>
            <nav className="flex flex-col p-4">
                <Link to="/admin" className="font-bold text-lg hover:text-green-700">Ordenes</Link>
                <Link to="/admin/productos" className="font-bold text-lg hover:text-green-700 ">Productos</Link>
                <Link to="/admin/nuevo/producto" className="font-bold text-lg hover:text-green-700">+ Nuevo Producto</Link>
                <Link to="/admin/nuevo/categoria" className="font-bold text-lg hover:text-green-700">+ Nueva Categoria</Link>
                <Link to="/admin/inventario" className="font-bold text-lg hover:text-green-700">Inventario</Link>
                
            </nav>
            <div className="my-5 px-5">
                <button type="button" className="text-center bg-red-500 w-full p-3 font-bold text-white truncate cursor-pointer" onClick={logout}>Cerrar Sesión</button>
            </div>
        </aside>
    )

}
