
import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import ModalProducto from "../components/ModalProducto"
import Resumen from "../components/Resumen"
import Modal from 'react-modal'
import useQuiosco from "../hooks/useQuiosco"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import useAuth from "../hooks/useAuth"

const customStyles = {
    content: {
        top: "50%",
        left: "50%",
        right: "auto",
        bottom: "auto",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)"
    }
};
Modal.setAppElement('#root')
export default function Layout() {

    const {user, error} = useAuth({middleware: 'auth'})
    const {modal} = useQuiosco();

    return (
        <>
            <div className="md:flex">
                <aside className="h-screen overflow-y-scroll">
                <Sidebar />
                </aside>

                <main className="flex-1 bg-gray-100 p-3"> 
                    <Outlet />
                </main>
                {/*<aside className="h-screen overflow-y-scroll">}
                    {/*<Resumen />
                </aside>*/}
                
            </div>

            <Modal isOpen={modal} style={customStyles}>
                <ModalProducto />
            </Modal>
            <ToastContainer />
        </>
    )


}
