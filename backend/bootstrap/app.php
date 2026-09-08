<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Toda peticion a /api/* debe responder SIEMPRE en JSON.
        // Sin esto, un error de validacion devuelve una redireccion HTML
        // cuando el cliente no envia la cabecera Accept: application/json.
        $exceptions->shouldRenderJsonWhen(function ($peticion, Throwable $e) {
            return $peticion->is('api/*') || $peticion->expectsJson();
        });
    })->create();
