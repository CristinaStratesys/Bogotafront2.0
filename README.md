# 🚀 Proyecto MEGA - Dashboard Interactivo (React + Python FastAPI)

Este repositorio contiene la arquitectura desacoplada (Frontend y Backend separados) para el proyecto de análisis empresarial MEGA.

El **Frontend** (interfaz de usuario) está construido con **React (Vite)** y **Tailwind CSS**.
El **Backend** (API de datos) está construido con **Python (FastAPI)**.

---

## ⚙️ Requisitos Previos

Asegúrate de tener instalados los siguientes programas en tu sistema:

1.  **Python** (versión 3.9+)
2.  **Node.js y npm** (o yarn/pnpm)
3.  **Git**
4.  Un editor de código (Se recomienda **VS Code**)

---

## 🛠️ 1. Configuración Inicial (Solo la Primera Vez)

Si acabas de clonar el repositorio, debes ejecutar estos comandos para instalar todas las dependencias:

* **En la carpeta `backend`:**
    ```bash
    # Crear entorno virtual (si no existe)
    python -m venv venv
    # Activar el entorno
    # [Windows]: venv\Scripts\activate
    # [Mac/Linux]: source venv/bin/activate
    # Instalar librerías
    pip install fastapi "uvicorn[standard]"
    ```
* **En la carpeta `frontend`:**
    ```bash
    npm install
    # Configuración Tailwind (si es necesaria)
    npx tailwindcss init -p
    ```

---

## ▶️ 2. Uso Diario y Reactivación del Proyecto

Para trabajar en el proyecto, necesitas **dos terminales separadas** corriendo simultáneamente: una para el Backend y otra para el Frontend.

### Terminal 1: Iniciar el Backend (API de Datos)

Esta terminal se encarga de servir los datos desde Python.

1.  **Entra al directorio `backend`** y activa el entorno virtual:
    ```bash
    cd backend
    # EJECUTAR EL COMANDO DE ACTIVACIÓN:
    # Windows: venv\Scripts\activate
    # Mac/Linux: source venv/bin/activate
    ```
2.  **Inicia el servidor API:**
    ```bash
    uvicorn main:app --reload --port 8000
    Si no va, prueba: python -m uvicorn main:app --reload --port 8000
    ```
    El Backend estará corriendo en: `http://localhost:8000`.

### Terminal 2: Iniciar el Frontend (Aplicación React)

Esta terminal se encarga de servir la interfaz de usuario.

1.  **Entra al directorio `frontend`:**
    ```bash
    cd .\frontend
    ```
2.  **Ejecuta la aplicación React:**
    ```bash
    npm run dev
    ```
    El Frontend estará accesible en: `http://localhost:5173`.

---

## 🔗 3. Conexión y Pruebas

1.  Una vez que ambos servidores muestren `Running` o `Ready` en sus terminales, abre la URL del Frontend (`http://localhost:5173`) en tu navegador.
2.  La aplicación de React se cargará e intentará automáticamente conectarse al servidor Python (`:8000`) para obtener los datos.

**(Nota: Si encuentras problemas de CORS, deberás añadir configuración de CORS a tu archivo principal de FastAPI/Python.)**