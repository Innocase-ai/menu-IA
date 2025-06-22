import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { MenuData, MenuCategory, MenuItem } from '../types';

const MODEL_NAME = "gemini-2.5-flash-preview-04-17";

// Simple UUID v4 generator
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const getPromptWithSchema = (): string => {
  return `Analyse l'image de ce menu de restaurant. Extrais le nom du restaurant, les catégories (par exemple, Entrées, Plats Principaux, Desserts, Boissons), et pour chaque catégorie, la liste des plats avec leur nom, une brève description si disponible, et leur prix.
Structure la sortie IMPÉRATIVEMENT au format JSON suivant :
{
  "restaurantName": "string (nom du restaurant)",
  "categories": [
    {
      "categoryName": "string (nom de la catégorie, ex: Entrées)",
      "items": [
        {
          "name": "string (nom du plat)",
          "description": "string (description du plat, DOIT être une chaîne vide "" si non disponible, PAS null ni absente)",
          "price": "string (prix du plat, ex: €12.50 ou 15$)"
        }
      ]
    }
  ]
}
Assure-toi que la description soit une chaîne vide ("") si elle n'est pas explicitement présente sur le menu.
Ne renvoie AUCUN texte explicatif, AUCUN commentaire, et AUCUN markdown (comme \`\`\`json) en dehors de l'objet JSON lui-même. La réponse doit être UNIQUEMENT l'objet JSON valide.`;
};


export const extractMenuData = async (base64ImageData: string): Promise<MenuData> => {
  if (!process.env.API_KEY) {
    throw new Error("La clé API Gemini (process.env.API_KEY) n'est pas configurée.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = getPromptWithSchema();
  
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg', 
      data: base64ImageData,
    },
  };

  const textPart = { text: prompt };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [{ parts: [textPart, imagePart] }],
      config: {
        responseMimeType: "application/json",
      },
    });
    
    let jsonText = response.text;

    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonText.match(fenceRegex);
    if (match && match[1]) {
      jsonText = match[1].trim();
    } else {
      jsonText = jsonText.trim();
    }
    
    try {
      const parsedData = JSON.parse(jsonText);
      
      // Validate the structure: restaurantName must be a string, and categories must be an array.
      if (typeof parsedData.restaurantName !== 'string' || !Array.isArray(parsedData.categories)) {
        console.error("Format JSON inattendu:", parsedData);
        throw new Error("La structure des données du menu reçue est incorrecte.");
      }

      // Add unique IDs and ensure descriptions are strings
      const menuWithIds: MenuData = {
        ...parsedData,
        restaurantName: parsedData.restaurantName, // Ensures it's carried over, even if empty
        categories: parsedData.categories.map((category: any) => {
          // Ensure categoryName is a string, default to "Catégorie inconnue" if not
          const categoryName = typeof category.categoryName === 'string' ? category.categoryName : "Catégorie inconnue";
          const items = Array.isArray(category.items) ? category.items : [];

          return {
            ...category,
            id: uuidv4(),
            categoryName: categoryName,
            items: items.map((item: any) => ({
              ...item,
              id: uuidv4(),
              name: typeof item.name === 'string' ? item.name : "Article inconnu",
              description: typeof item.description === 'string' ? item.description : "",
              price: typeof item.price === 'string' ? item.price : "N/A",
            })),
          };
        }),
      };
      return menuWithIds;
    } catch (parseError: any) {
      console.error("Erreur de parsing JSON:", parseError, "Texte reçu:", jsonText);
      throw new Error(`Impossible d'analyser la réponse JSON du serveur: ${parseError.message}. Contenu reçu: ${jsonText.substring(0, 500)}`);
    }

  } catch (error: any) {
    console.error("Erreur de l'API Gemini:", error);
    if (error.message && error.message.includes('permission denied')) {
        throw new Error("Erreur d'API Gemini: Permission refusée. Vérifiez votre clé API et les autorisations du modèle.");
    }
    if (error.message && error.message.includes('API key not valid')) {
         throw new Error("Erreur d'API Gemini: Clé API non valide. Veuillez vérifier votre clé API.");
    }
    // Check if the error is due to safety settings or other block reasons
    if (error.response?.promptFeedback?.blockReason) {
      const blockReason = error.response.promptFeedback.blockReason;
      const blockMessage = error.response.promptFeedback.blockReasonMessage || "Aucun message spécifique.";
      throw new Error(`La requête a été bloquée par l'API Gemini. Raison: ${blockReason}. Message: ${blockMessage}`);
    }
    const apiError = error.message || "Une erreur inconnue est survenue avec l'API Gemini.";
    throw new Error(`Erreur de l'API Gemini: ${apiError}`);
  }
};