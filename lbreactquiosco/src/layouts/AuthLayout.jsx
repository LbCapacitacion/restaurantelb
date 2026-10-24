import { Outlet } from "react-router-dom"

export default function AuthLayout(){
    return (
        <main className="max-w-4xl m-auto mt-5 md:mt-18 flex flex-col md:flex-row items-center">
            <img src="../img/cafe.png" alt="imagen logotipo" className="max-w-xs" />
            <div className="p-3 w-full">
                <Outlet />
            </div>
        </main>
       
    )
}