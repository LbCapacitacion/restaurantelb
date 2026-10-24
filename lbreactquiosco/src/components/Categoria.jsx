import useQuiosco from "../hooks/useQuiosco"

export default function Categoria({categoria}){//destructuring extrae de props la propiedad categoria 
    
    const {handleClickCategoria, categoriaActual} = useQuiosco()
    
    const {icono, id, nombre} = categoria

    const resaltarCategoriaActual = () => categoriaActual.id === id ? 'bg-amber-400' : 'bg-white'
    return(
        // <div className={`${resaltarCategoriaActual()} flex items-center gap-4 border w-full p-3 hover:bg-amber-400 cursor-pointer`}>
            
        //     <button className="text-lg font-bold cursor-pointer truncate" type="button" onClick={()=> handleClickCategoria(id)}>{nombre}</button>
        // </div>

        <button type="button" onClick={()=> handleClickCategoria(id)} className={`${resaltarCategoriaActual()} flex items-center gap-4 border w-full p-3 hover:bg-amber-400 cursor-pointer`}><img src={`http://localhost:8000/${icono}`} alt="imagen icono" className="w-12" /><p className="text-lg font-bold">{nombre}</p></button>
    )
}
