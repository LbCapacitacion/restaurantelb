<?php

namespace App\Http\Controllers;

use App\Http\Resources\PedidoCollection;
use App\Models\Pedido;
use App\Models\PedidoProducto;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PedidoController extends Controller
{
    public function index()
    {
        return new PedidoCollection(Pedido::with('user')->with('productos')->where('estado', 0)->get());
    }

    public function store(Request $request)
    {

        $request->validate([
            'mesa' => 'required|string',
            'total' => 'required|numeric',
            'productos' => 'required|array',
            'productos.*.id' => 'required|exists:productos,id',
            'productos.*.cantidad' => 'required|integer|min:1'
        ]);
        //almacenar una orden

        try {
            DB::beginTransaction();

            $pedido = new Pedido;
            $pedido->user_id = Auth::user()->id;
            $pedido->mesa = $request->mesa;
            $pedido->total = $request->total;
            $pedido->save();

            $pedido_producto = [];

            foreach ($request->productos as $producto) {
                $pedido_producto[] = [
                    'pedido_id' => $pedido->id,
                    'producto_id' => $producto['id'],
                    'cantidad' => $producto['cantidad'],
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now()
                ];
            }

            PedidoProducto::insert($pedido_producto);

            DB::commit();

            return response()->json([
                'message' => 'Pedido realizado correctamente'
            ]);
        } catch (\Exception $e) {
            DB::rollBack(); //si algo falló, revertir todo
            Log::error('Error en el pedido: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al procesar el pedido'
            ], 500);
        }

    }

    public function update(Request $request, Pedido $pedido)
    {
        $pedido->estado = 1;
        $pedido->save();

        return [
            'pedido' => $pedido
        ];
    }

    public function complete(Request $request, Pedido $pedido){
        try{
            $pedido->estado = 1;
            $pedido->save();

            return response()->json([
                'message' => 'Pedido completado',
                'data' => $pedido->load('productos', 'user')
            ],200);
        }catch(\Throwable $e){
            Log::error('Error completando el pedido: ' . $e->getMessage() . ' en ' . $e->getFile() . ' linea ' . $e->getLine());
            return response()->json(['message' => 'Error al completar el pedido'], 500);
        }
    }

    public function ventasDelDia(Request $request){
        $dateString = $request->query('date', now()->toDateString());

        try{
            $date = Carbon::parse($dateString);

            $start = $date->copy()->setTime(10,0,0);

            $end = $date->copy()->setTime(19,0,0);

            $pedidos = Pedido::with('productos', 'user')
                ->where('estado', 1)
                ->whereBetween('updated_at', [$start, $end])
                ->get();

            $totalDia = $pedidos->sum('total');

            return response()->json([
                'date' => $date->toDateString(),
                'start' => $start->toDateTimeString(),
                'end' => $end->toDateTimeString(),
                'total_sales' => $totalDia,
                'count' => $pedidos->count(),
                'pedidos' => $pedidos
            ],200);
        }catch(\Throwable $e){
            Log::error('Error al generar reporte de ventas: ' . $e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine());
            return response()->json(['message' => 'Error al generar reporte'], 500);
        }

    }
}
