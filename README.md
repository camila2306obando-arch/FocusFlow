# FocusFlow 🧠✨
### *Productividad Calma, Visual y Gamificada para Mentes Diversas (TDAH)*

FocusFlow es una aplicación web full-stack de productividad premium y relajante, diseñada específicamente para ayudar a personas con TDAH y dificultades de concentración a organizar sus objetivos cotidianos de forma visual, motivadora y libre de sobrecarga cognitiva.

Visita el panel de **Temporizadores** para escuchar el **drone de enfoque musical sintetizado** (generado en tiempo real con Web Audio API local) y activa la **División Inteligente con IA** para desglosar tus tareas grandes en micro-pasos de acción concreta libres de parálisis de análisis.

---

## 🎨 Características de Diseño UI/UX (ADHD-First)
- **Fondo Oscuro Elegante (`Slate-900` & `Slate-800`)**: Eye-safe, reduce distracciones visuales y fatiga ocular.
- **Espaciado Generoso y Glassmorphism Suave**: Mayor negative space para evitar la asfixia visual e interfaces saturadas.
- **Acciones Directas y Inputs Grandes**: Minimiza la fricción inicial para que registrar una tarea sea cuestión de un segundo.
- **Gamificación Dopaminérgica Rápida**: Acumulación de XP, niveles rápidos de 100 XP, racha diaria animada y burbujas de puntos flotantes flotantes (`+25 XP`) que celebran tus logros de inmediato de una manera alegre y empática.

---

## 🚀 Funcionalidades Principales

### 1. Dashboard Principal
- Saludo dinámico adaptado a la hora del día con mensajes compasivos ("pasito a pasito").
- Barra de progreso del día que muestra cuántas tareas has finalizado de forma compacta.
- **Motivational Cards**: Recordatorios amables para aliviar la ansiedad de la procrastinación. Puedes presionar el botón de rotación para obtener sugerencias instantáneas.

### 2. Gestión de Tareas Inteligente y Visual
- Prioridades codificadas por colores suaves en alto contraste (`Alta`, `Media`, `Baja`).
- Categorías intuitivas (Estudios, Trabajo, Personal, Hogar, Salud, Ocio).
- Registro rápido de subtareas y pasos manuales.
- **Persistencia Local Completa**: Respaldado de forma segura en `localStorage`.

### 3. División Inteligente de Tareas (Inteligencia Artificial Gemini)
- ¿Tienes un objetivo enorme como "Hacer ensayo argumentativo"? Presiona **Dividir tarea con IA ✨**.
- El servidor hace uso del modelo **Gemini 3.5-Flash** para desglosar tu tarea en un set de entre 4 y 6 micro-pasos secuenciales rápidos de acción e incluye una retroalimentación motivacional personalizada para ganar seguridad inicial.
- *Failsafe*: Si la clave API de Gemini no está configurada, el sistema activa de forma local un constructor inteligente de fallback que te dará una maravillosa planificación y sugerencias específicas.

### 4. Modo Enfoque Multi-Temporizador
- **Pomodoro**: Períodos ajustables de flujo concentrado y recreo (25m / 5m).
- **Flowtime Libre**: Un contador ascendente para quienes disfrutan el hiperenfoque prolongado y no toleran las alarmas intrusivas. Permite frenar y cobrar tus puntos XP acumulados, entregándote un descanso personalizado acorde.
- **Ambiente de Sonido Sintético**: Sintetizador analógico de ondas y filtros para bloquear el ruido exterior generado directamente por tu navegador mediante **Web Audio API**.

### 5. Time Blocking Visual
- Coloca tus actividades en ranuras horarias de forma limpia de 07:00 a 22:00.
- Evita la parálisis de decisión sabiendo exactamente en qué momento del día asignar recursos de atención.

---

## 📂 Estructura del Código

```
/
├── server.ts               # Servidor Express Full-stack proxies Gemini e integra Vite
├── package.json            # Scripts de build y árbol de paquetes npm
├── vite.config.ts          # Integración del compilador Vite y Tailwind v4
├── index.html              # Entrada estática del DOM
├── src/
│   ├── main.tsx            # Punto de montaje React 19 StrictMode
│   ├── App.tsx             # Panel de control, cargadores localStorage y layout responsive
│   ├── types.ts            # Interfaces y contornos TypeScript de tareas y estadísticas
│   ├── utils.ts            # Utilidades de motivación, calendarios, niveles y rachas
│   └── components/
│       ├── XPStatus.tsx    # Gamificación superior, barra de XP y burbuja flotante animada
│       ├── QuickStats.tsx  # Panel de progreso del día y carrusel de motivación
│       ├── FocusMode.tsx   # Temporizador de enfoque con síntesis de Audio calibrado
│       ├── VisualCalendar.tsx # Bloques de time blocking diario y carga por secciones
│       ├── TaskForm.tsx    # Formularios simplificados para añadir metas
│       └── TaskCard.tsx    # Tarjeta de vidrio, subtareas y trigger de división de IA proxy
```

---

## 🛠️ Comandos de Instalación y Ejecución

Sigue estos sencillos pasos para probar la experiencia localmente:

1. **Instalar Dependencias**:
   ```bash
   npm install
   ```

2. **Configurar Variables de Entorno**:
   Copia el archivo `.env.example` como `.env` e introduce tu clave secreta de Google AI Studio:
   ```env
   GEMINI_API_KEY="TU_CLAVE_AI_STUDIO_AQUÍ"
   ```

3. **Iniciar Servidor de Desarrollo**:
   ```bash
   npm run dev
   ```
   La aplicación estará disponible de inmediato en: `http://localhost:3000`.

4. **Compilar para Producción**:
   ```bash
   npm run build
   ```
   Esto compila el frontend de Vite en `/dist` y empaqueta el servidor de TypeScript en un CJS bundle autointuitivo en `/dist/server.cjs` usando `esbuild`.

5. **Lanzar en Producción**:
   ```bash
   npm run start
   ```
