<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\PedidoController;
use App\Http\Controllers\ProductoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

// Route::middleware('auth:sanctum')->group(function(){
//     Route::apiResource('/productos', ProductoController::class);
// });

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('/pedidos', PedidoController::class);


    Route::apiResource('/productos', ProductoController::class);
    //Route::apiResource('/pedidos', PedidoController::class);

    Route::put('/productos/{producto}/recargar-stock',[ProductoController::class, 'recargarStock']);
    Route::put('/productos/{producto}/agotado',[ProductoController::class, 'marcarAgotado']);
    Route::put('/productos/{producto}/disponible',[ProductoController::class, 'marcarDisponible']);
    Route::put('/productos/{id}/vaciar-stock',[ProductoController::class, 'vaciarStock']);

    Route::get('/productos/admin', [ProductoController::class, 'adminIndex']);

    Route::patch('/pedidos/{pedido}/complete', [PedidoController::class, 'complete']);

    Route::get('/reportes/ventas',[PedidoController::class, 'ventasDelDia']);
    
});
 Route::apiResource('/categorias', CategoriaController::class)->except(['show']);



Route::post('/registro', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
