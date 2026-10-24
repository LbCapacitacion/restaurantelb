import { Outlet } from "react-router-dom"
import useAuth from "../hooks/useAuth"
import AdminSidebar from "../components/AdminSidebar"

export default function AdminLayout() {
    useAuth({ middleware: 'admin' })
    return (

        <div className="md:flex">
            <AdminSidebar />
            <main className="flex-1 h-screen overflow-y-scroll bg-gray-100 p-3">
                <Outlet />
            </main>
        </div>
    )
}