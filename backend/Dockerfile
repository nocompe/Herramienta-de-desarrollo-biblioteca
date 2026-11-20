# Imagen de produccion del backend de BiblioTech UTP (Laravel 12 + SQLite).
# La construye y publica el pipeline de CD en ghcr.io.
#
# Las dependencias se instalan con el mismo PHP 8.2 de la imagen final: la
# imagen composer:2 trae su propio PHP, que cambia de version sin aviso (#36).
FROM php:8.2-cli AS dependencias
RUN apt-get update \
    && apt-get install -y --no-install-recommends unzip \
    && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
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
