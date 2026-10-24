import useSWR from "swr"
import clienteAxios from "../config/axios"
import { formatearDinero } from "../helpers"
import useQuiosco from "../hooks/useQuiosco"
import { useState } from "react"
import { toast } from "react-toastify"


export default function Ordenes(){
    const token = localStorage.getItem('AUTH_TOKEN')

    const fetcher = () => clienteAxios('/api/pedidos',{
        headers:{
            Authorization: `Bearer ${token}`
        }
    })

    const {data, error, isLoading} = useSWR('/api/pedidos', fetcher, {refreshInterval: 1000})

    

    const [reportLoading, setReportLoading] = useState(false)

    const printTicket = (pedido) => {
        const itemsHtml = pedido.productos.map(p => {
            const cantidad = p.pivot?.cantidad ?? 1;
            const precio = p.precio ?? p.pivot?.precio_unitario ?? 0;
            return `
                <tr>
                    <td style="padding:4px 0;">${p.nombre}</td>
                    <td style="padding:4px 0; text-align:center;">${cantidad}</td>
                    <td style="padding:4px; text-align:right;">${formatearDinero(precio * cantidad)}</td>
                </tr>
            `
        }).join('')

        const total = formatearDinero(pedido.total)
        const meseroName = pedido.user?.name ?? 'N/A'
        
        const html = `
            <thml>
                <head>
                    <title>
                        Ticket ${pedido.id}
                    </title>
                    <style>
                        @media print {
                            @page { margin: 0;}
                            body{ margin: 0;}
                        }
                        body{font-family: monospace; width: 280px; padding: 10px; }
                        .center{ text-align: center;}
                        .bold {font-weight: 700;}
                        table{
                            width: 100%;
                            border-collapse: collapse;
                            font-size: 12px;
                        }
                        hr{
                            border: none;
                            border-top: 1px dashed #000;
                            margin: 8px 0;
                        }
                        .total {
                            font-size: 15px;
                            margin-top: 8px;
                        }
                    </style>
                </head>
                <body>
                    <div class="center">
                        <h3 class="bold">Restaurant</h3>
                        <div>Detalle de venta</div>
                        <div>Tel: 2214785600</div>
                        <hr/>
                        <div>Cliente: ${pedido.mesa ?? 'Consumidor'}</div>
                        <hr/>
                        <div>Fecha: ${new Date(pedido.created_at ?? Date.now()).toLocaleString()}</div>
                        <hr/>
                    </div>
                    <table>
                        ${itemsHtml}
                    </table>
                    <hr/>
                    <div class="total">
                        <div style="display:flex; justify-content:space-between;">
                            <div class="bold">TOTAL</div>
                            <div class="bold">${total}</div>
                        </div>
                    </div>
                    <div class="center" style="margin-top:12px;">
                        Siguenos en:
                    </div>
                    <div class="center" style="margin-top:12px;">
                        FB Restaurant
                    </div>
                    <div class="center" style="margin-top:12px;">
                        ¡Gracias por su compra!
                    </div>
                    <script>
                        window.onload = function(){
                            window.print()
                            setTimeout(() => {
                                window.close()
                            }, 500);
                        } 
                    </script>
                </body>
            </html>
        `
        const w = window.open('', '_blank', 'width=340, height=600')
        if(!w){
            alert('Permite ventanas emergentes para poder imprimir el ticket.')
            return
        }
        w.document.open()
        w.document.write(html)
        w.document.close()
    }


    const completarEImprimir = async (pedido) =>{
        try{
            await clienteAxios.patch(`/api/pedidos/${pedido.id}/complete`, {}, {
                headers:{Authorization: `Bearer ${token}`}
            })

            printTicket(pedido)
            setTimeout(() => {
                printTicket(pedido)
            }, 1000);
        }catch(err){
            console.error(err)
            toast.error('Error al completar el pedido')
        }
    }

    const printDailyTicket = ({date, start, end, pedidos = [], total_sales = 0}) => {
        const rows = pedidos.map(pedido => {
            const items = (pedido.productos || []).map(prod => {
                const qty = prod.pivot?.cantidad ?? 1
                const price = prod.precio ?? prod.pivot?.precio_unitario ?? 0

                return `<div style="display:flex; justify-content:space-between; font-size:12px; margin:2px 0;">
                            <div style="width:60%">${prod.nombre} x${qty}</div>
                            <div style="width:40%; text-align:right">${formatearDinero(price * qty)}</div>
                
                        </div>`

            }).join('')
                return `<div style="border-top:1px dashed #000; padding-top:6px; margin-top:6px;">
                    <div style="font-size:13px; font-weight:700;">Pedido #${pedido.id} - ${pedido.mesa ?? 'Cliente'}</div>
                    ${items}
                    <div style="display:flex; justify-content:space-between; font-weight:700; margin-top:6px;">
                        <div>Total:</div><div>${formatearDinero(pedido.total)}</div>
                    </div>
                </div>`
        }).join('')
        const html = `
            <html>
                <head>
                    <title>Reporte de Ventas ${date}</title>
                    <style>
                        @media print {@page {margin:0;} body {margin:0;}}
                        body {
                            font-family: monospace;
                            width:280px;
                            padding:8px;
                            color: #000;
                        }
                        .center{text-align: center;}
                        hr{
                            border:none;
                            border-top: 1px dashed #000;
                            margin: 6px 0;
                            
                        }
                    </style>
                </head>
                <body>
                    <div class="center">
                        <div style="font-size:16px; font-weight:700">Restaurante</div>
                        <div style="font-size:12px;">Reporte - Ventas Turno 10:00 - 19:00</div>
                        <div style="font-size:11px; margin-top:6px;">Referencia: ${date}</div>
                        <div style="font-size:11px;">Periodo: ${start} - ${end}</div>
                        <hr/>
                    </div>
                    ${rows || '<div style="text-align:center; margin:8px 0;">No hay ventas en este turno.</div>'}
                    <hr />
                    <div style="display:flex; justify-content:space-between; font-weight:700; font-size:14px; margin-top:8px;">
                        <div>Total Turno</div>
                        <div>${formatearDinero(total_sales)}</div>
                    </div>

                    <div class="center" style="margin-top:10px; font-size:11px;">Restaurante</div>

                    <script>

                    </script>
                </body>
            </html>
        `
        const w = window.open('', '_blank', 'width=340,height=700')
        if(!w){
            alert('Permite ventanas emergentes para imprimir el ticket del reporte')
            return
        }
        w.document.open()
        w.document.write(html)
        w.document.close()
    }

    const generarReporteDiario = async (date) =>{
        setReportLoading(true)

        try {
            const qDate = date ?? new Intl.DateTimeFormat('en-CA',{
                timeZone: 'America/Mexico_City'

            }).format(new Date())
            
            const resp = await clienteAxios.get(`/api/reportes/ventas?date=${qDate}`,{
                headers: {Authorization: `Bearer: ${token}`}
            })

            const payload = resp.data ?? resp
            const data = payload.data ?? payload

            const output = {
                date: data.date ?? qDate,
                start: data.start ?? data.start ?? '',
                end: data.end ?? data.end ?? '',
                pedidos: data.pedidos ?? data.pedidos ?? data.data ?? [],
                total_sales: data.total_sales ?? data.total_sales ?? data.total ?? 0
            }

            printDailyTicket(output)
        } catch (err) {
            console.error(err)
            alert('Error al generar reporte')
        }finally{
            setReportLoading(false)
        }
    }


    if(isLoading) return 'Cargando...';

    return(
        <div>
            <h1 className="text-4xl font-black">Ordenes</h1>
            <p className="text-2xl my-10">
                Administra las ordenes desde aqui
            </p>
            <div className="mb-6 flex gap-3">
                <button
                    type="button"
                    className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded uppercase font-bold text-white"
                    onClick={() => generarReporteDiario()}
                    disabled={reportLoading}
                >
                    {reportLoading ? 'Generando...' : 'Generar informe ventas'}
                </button>
                <button type="button"
                    className="bg-slate-600 hover:bg-slate-800 px-4 py-2 rouded uppercase font-bold text-white"
                    onClick={()=>{
                        const day = prompt('Fecha (YYYY-MM-DD) para reporte (referencia de inicio de turno):', new Date().toISOString().slice(0,10));
                        if(day) generarReporteDiario(day);
                    }}
                >
                        Fecha especifica
                </button>
            </div>
            <div className="grid grid-cols-2 gap-5">
                {data.data.data.map(pedido =>(
                    <div key={pedido.id} className="p-5 bg-white shadow space-y-2 border-b">
                        <p className="text-xl font-bold text-slate-600">
                            Contenido del pedido:
                        </p>
                        {pedido.productos.map(producto =>(
                            <div key={producto.id} className="border-b border-b-slate-200 last-of-type:border-none py-4">
                                <p className="text-sm">ID: {producto.id}</p>
                                <p>{producto.nombre}</p>
                                <p>
                                    Cantidad: {''}
                                    <span className="font-bold">{producto.pivot.cantidad}</span>
                                </p>
                            </div>
                        ))}
                        <p className="text-lg font-bold text-slate-600">
                            Cliente: {''}
                            <span className="font-normal">{pedido.mesa}</span>
                        </p>
                        <p className="text-lg font-bold text-amber-600">
                            Total a pagar: {''}
                            <span className="font-normal text-slate-600">{formatearDinero(pedido.total)}</span>
                        </p>
                        <button type="button"
                            className="bg-indigo-600 hover:bg-indigo-800 px-5 py-2 rounded
                            uppercase font-bold text-white text-center w-full cursor-pointer"
                            onClick={()=>completarEImprimir(pedido)}

                        >
                            Completar
                        </button>
                    </div>
                ))}
            </div>

        </div>
    )
}
