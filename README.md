# DISERCO-Inventory

Sistema de inventario para DISERCO contiene:

- **Backend**: API en Python con FastAPI.
- **Frontend**: SPA en React + TypeScript (Vite) + Bun para operar el sistema.
- **Base de datos**: PostgreSQL (alojado en NEON).

## Estructura

- `Backend/`: API, entidades, esquema/validaciones y utils (reportes, correo, etc.).
- `Frontend/`: SPA (rutas, páginas, servicios, hooks).

## Dependencias principales

### Backend
- UV 
- FastAPI + Uvicorn
- SQLAlchemy
- Pydantic
- psycopg2 (PostgreSQL)
- JWT (PyJWT)
- bcrypt / cryptography
- APScheduler
- openpyxl, python-docx, docx2pdf (reportes/archivos)
- python-dotenv

### Frontend
- React
- React Router
- Axios
- @tanstack/react-query
- PrimeReact / PrimeIcons

## Ejecucion

### Backend
1. Instalar dependencias:
   ```bash
   cd Backend
   uv sync --frozen --no-dev --no-install-project
   ```
2. Ejecutar en modo desarrollador:
   ```bash
   uv run fastapi dev cmd/main.py
    ```
3. Para producción, usar Uvicorn:
   ```bash
   uv run uvicorn cmd.main:app --host 0.0.0.0 --port 8000
    ```

### Frontend
1. Instalar dependencias y construir:
   ```bash
   bun install && bun run build
    ```

## Variables de entorno (ejemplo)

### Backend (`Backend/.env`)

```
FRONTEND_URL=https://tu-frontend.com
JWT_SECRET=CONTRASEÑA_SECRETA_PARA_JWT
JWT_ALGORITHM=HS256
SMTP_SERVER=smtp.serviciosmtp.com
SMTP_PORT=587
SMTP_USER=usuario-correo
SMTP_PASSWORD=contraseña-usuario
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/nombre_db?sslmode=require&channel_binding=require
```

### Frontend (`Frontend/.env`)

```
VITE_API_URL=https://tu-backend.com
```
