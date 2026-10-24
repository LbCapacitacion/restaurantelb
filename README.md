# Nombre del Proyecto

Restaurantelb

## Tecnologías

- Frontend: React
- Backend: Laravel
- Base de datos: MySQL

## Instalación

bash
# Clonar
git clone https://github.com/LbCapacitacion/restaurantelb/tree/main
cd TU-REPO

# Backend
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate

# Frontend
cd ../frontend
npm install
