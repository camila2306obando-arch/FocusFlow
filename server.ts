import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route to split a task into steps using Gemini
app.post("/api/gemini/split-task", async (req, res) => {
  const { title, category } = req.body;

  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "Title is required" });
  }

  // Handle missing key gracefully to prevent the application from crashing
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    // Elegant hardcoded fallback steps for common tasks, or generic steps matching the title keywords
    console.warn("GEMINI_API_KEY is not defined. Using local fallback smart task generator.");
    
    let steps: string[] = [];
    let motivation = "¡Has dado el primer paso que suele ser el más difícil! Enfócate en una mini-tarea a la vez.";
    
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes("estudiar") || lowerTitle.includes("leer") || lowerTitle.includes("examen")) {
      steps = [
        "Preparar tu espacio: limpia el escritorio y ten agua a la mano (2 min)",
        "Leer únicamente un párrafo o página libre de distracciones (10 min)",
        "Anotar 3 ideas clave en una hoja de papel (5 min)",
        "Hacer un mini resumen mental o explicárselo a alguien en voz alta (5 min)",
        "Tomar un descanso de estiramiento (5 min)"
      ];
      motivation = "Dividir el estudio reduce la pereza mental. ¡Intenta superar solo el primer paso primero!";
    } else if (lowerTitle.includes("limpiar") || lowerTitle.includes("ordenar") || lowerTitle.includes("habitación") || lowerTitle.includes("casa")) {
      steps = [
        "Poner un temporizador de 10 minutos y tu música favorita (2 min)",
        "Recoger todas las prendas de ropa del suelo y ponerlas en un solo lugar (5 min)",
        "Despejar y limpiar únicamente una superficie pequeña, como el escritorio o mesa (5 min)",
        "Llevar la basura acumulada al contenedor (3 min)",
        "Celebrar el cambio visual inmediato en tu espacio (1 min)"
      ];
      motivation = "No tienes que limpiar todo. Una pequeña área limpia te dará claridad mental.";
    } else if (lowerTitle.includes("escribir") || lowerTitle.includes("ensayo") || lowerTitle.includes("informe") || lowerTitle.includes("reporte") || lowerTitle.includes("tarea")) {
      steps = [
        "Abrir un documento en blanco y escribir solo el título (2 min)",
        "Anotar 3 o 4 palabras clave o ideas principales sin importar el orden (5 min)",
        "Escribir un borrador ultra rápido de 3 oraciones de introducción (8 min)",
        "Desarrollar un solo párrafo de idea principal (10 min)",
        "Revisar la ortografía sencillamente y festejar el avance (5 min)"
      ];
      motivation = "¡El borrador perfecto no existe! Un borrador sucio te da el poder de editar después.";
    } else if (lowerTitle.includes("ejercicio") || lowerTitle.includes("gimnasio") || lowerTitle.includes("entrenar") || lowerTitle.includes("correr")) {
      steps = [
        "Ponerte tu ropa y zapatillas deportivas de inmediato (3 min)",
        "Hacer 3 minutos de estiramientos o saltos suaves para calentar de forma divertida (3 min)",
        "Definir una meta muy pequeña, como 15 minutos de actividad (2 min)",
        "Realizar el ejercicio a tu propio ritmo escuchando algo estimulante (15 min)",
        "Felicitarte y tomar agua fresca (2 min)"
      ];
      motivation = "La parte más difícil es ponerse los tenis. ¡Una vez puestos, ya ganaste el día!";
    } else {
      // Generic smart subdivision of tasks for someone with ADHD
      steps = [
        `Definir con precisión el primer mini paso para: '${title}' (2 min)`,
        "Poner un temporizador de enfoque de 10 minutos para iniciar sin presión (1 min)",
        "Eliminar todas las distracciones del campo visual de inmediato (2 min)",
        "Hacer el primer tercio de la tarea enfocándote únicamente en finalizarlo (10 min)",
        "Tomar una pausa de 3 minutos para recuperar energía mental (3 min)",
        "Celebrar el progreso y evaluar si deseas continuar (2 min)"
      ];
      motivation = "¡Tu cerebro adora el progreso inmediato! Concéntrate solo en empezar, el resto fluirá.";
    }

    return res.json({ steps, motivation });
  }

  try {
    // Setup server-side Gemini GenAI Client with User-Agent heading
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const prompt = `Actúa como un psicólogo y experto en productividad para adultos con TDAH. Necesito desglosar una tarea en pasos ultra-pequeños, prácticos, visuales y que no generen ansiedad ni parálisis de análisis.
Tarea a dividir: "${title}" ${category ? `(Categoría: ${category})` : ""}.
Por favor, analiza la tarea y devuélveme entre 4 y 6 pasos sumamente secuenciales, sencillos y específicos que incluyan un tiempo estimado muy corto (ej. "2 min", "5 min").
También incluye una frase corta de alta motivación ("motivation") enfocada en superar la procrastinación propia del TDAH. Evita la sobrecarga verbal y sé empático. Idioma: Español.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de 4 a 6 micro-pasos de acción concreta para realizar la tarea, cada uno con una duración corta sugerida entre paréntesis al final."
            },
            motivation: {
              type: Type.STRING,
              description: "Frase motivacional super empática y clara para animarle a superar la resistencia inicial."
            }
          },
          required: ["steps", "motivation"]
        }
      }
    });

    const resultText = response.text;
    if (resultText) {
      const data = JSON.parse(resultText.trim());
      return res.json(data);
    } else {
      throw new Error("No text response from Gemini");
    }
  } catch (err: any) {
    console.error("Gemini division error:", err);
    return res.status(500).json({ error: "Error al dividir la tarea mediante IA. Inténtalo de nuevo." });
  }
});

// Configure Vite or serve static assets
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FocusFlow server running at http://localhost:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error("Failed to start server:", err);
});
