# Imagen de produccion del backend de BiblioTech UTP (Laravel 12 + SQLite).
# La construye y publica el pipeline de CD en ghcr.io.
FROM composer:2 AS dependencias
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --prefer-dist --no-progress

FROM php:8.2-cli
WORKDIR /app

COPY --from=dependencias /app/vendor ./vendor
COPY . .

RUN cp .env.example .env \
    && php artisan package:discover --ansi \
    && chmod +x docker-entrypoint.sh

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    DB_CONNECTION=sqlite \
    PORT=8000

EXPOSE 8000
ENTRYPOINT ["./docker-entrypoint.sh"]
