#!/bin/sh
# Arranque del contenedor: clave de la app, base de datos y servidor.
set -e

if ! grep -q '^APP_KEY=base64' .env; then
    php artisan key:generate --force
fi

# Los datos de ejemplo solo se cargan la primera vez que se crea la base.
if [ ! -f database/database.sqlite ]; then
    touch database/database.sqlite
    php artisan migrate --force --seed
else
    php artisan migrate --force
fi

exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
