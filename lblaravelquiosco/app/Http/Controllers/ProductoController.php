<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductoCollection;
use App\Models\Producto;
use Illuminate\Http\Request;


class ProductoController extends Controller
{
    public function index(Request $request){


        $user = $request->user();

        $query = Producto::orderBy('id', 'DESC');

        if(!$user->admin){
            $query->where('disponible',1);
        }
        return new ProductoCollection($query->get());
        
    }

    public function update(Request $request, Producto $producto){
        $producto->disponible = 0;
        $producto->save();

        return [
            'producto' => $producto
        ];
    }

    public function store(Request $request){
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'precio' => 'required|numeric',
            'imagen' => 'nullable|image|max:2048',
            'disponible' => 'boolean',
            'categoria_id' => 'required|exists:categorias,id',
            'stock' => 'sometimes|integer|min:0'
            
        ]);
        if($request->hasFile('imagen')){
            $path = $request->file('imagen')->store('productos', 'public');
            $validated['imagen'] = basename($path);
        }
        $producto = Producto::create($validated);

        return response()->json($producto,201);
    }

    public function recargarStock(Request $request, Producto $producto){
        $user = $request->user();

        if(!$user->admin){
            return response()->json(['error' => 'No autorizado'], 403);

        }
        $validated = $request->validate([
            'cantidad' => 'required|integer|min:1'
        ]);

        $producto->increment('stock', $validated['cantidad']);

        $producto->refresh();

        return response()->json(['message' => 'Stock recargado correctamente', 'producto' => $producto]);
    }
    

    public function marcarAgotado(Producto $producto){
        $producto->disponible = 0;
        $producto->save();

        return response()->json(['message' => 'Producto marcado como agotado']);
    }
    
    public function marcarDisponible(Producto $producto){
        $producto->disponible = 1;
        $producto->save();

        return response()->json(['message' => 'Producto disponible nuevamente']);
    }
    public function vaciarStock($id){
        $producto = Producto::find($id);

        if(!$producto){
            return response()->json(['message' => 'Producto no encontrado'],404);
        }
        $producto->stock = 0;
        $producto->save();

        
        
        return response()->json([
            'message' => 'Stock restablecido a 0',
            'producto' => $producto
        ],200);
    }
}
