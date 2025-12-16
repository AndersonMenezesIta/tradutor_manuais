import { GoogleGenAI } from "@google/genai";
import { TranslationConfig } from "../types";

// Initialize Gemini
// Note: In a real production app, ensure API key is safe. 
// For this demo, we assume process.env.API_KEY is available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const translateTechnicalPage = async (
  base64Image: string,
  config: TranslationConfig
): Promise<string> => {
  // Remove data URL prefix if present
  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

  const prompt = `
    You are a specialized technical translator and document layout reconstruction engine. 
    
    **Task:**
    Analyze the provided image of a PDF page (which may contain diagrams, tables, and technical text).
    Translate ONLY the text content from ${config.sourceLanguage} to ${config.targetLanguage}.
    
    **Domain Context:** ${config.domain}.
    
    **Strict Guidelines:**
    1. **OCR & Layout:** Accurately detect all text. Return the result in **Markdown** format that mirrors the visual structure of the page.
    2. **Tables:** If a table exists, reconstruct it using Markdown tables. Preserve all numerical data exactly.
    3. **Technical Accuracy:** Use precise industry-standard terminology for the ${config.domain} sector. Do not simplify technical terms.
    4. **Images/Diagrams:** If there is a diagram, insert a placeholder like *[Diagram: description of diagram]* translated.
    5. **Formatting:** Use Headers (#, ##) for titles, bold (**text**) for emphasized text matching the original.
    6. **Output:** Return ONLY the Markdown string. Do not include conversational filler.
  `;

  const maxRetries = 3;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data
              }
            },
            {
              text: prompt
            }
          ]
        }
      });

      return response.text || "Error: No translation generated.";
    } catch (error: any) {
      attempt++;
      
      // Check for Rate Limit (429) or Service Overload (503)
      // The error object structure can vary, checking stringified version covers most bases
      const errorStr = JSON.stringify(error);
      const isQuotaError = 
        errorStr.includes('429') || 
        errorStr.includes('RESOURCE_EXHAUSTED') ||
        error?.status === 429 ||
        error?.code === 429;
      
      const isServerOverload = 
        errorStr.includes('503') ||
        error?.status === 503;

      if ((isQuotaError || isServerOverload) && attempt <= maxRetries) {
        // Exponential backoff with jitter: 2s, 4s, 8s... + random jitter
        const baseDelay = Math.pow(2, attempt) * 2000;
        const jitter = Math.random() * 1000;
        const waitTime = baseDelay + jitter;
        
        console.warn(`Gemini API Quota/Error (Attempt ${attempt}/${maxRetries}). Retrying in ${Math.round(waitTime)}ms...`);
        await delay(waitTime);
        continue;
      }

      console.error("Gemini Translation Error:", error);
      
      if (isQuotaError) {
         throw new Error("Quota exceeded. Please check your API plan or try again later.");
      }
      
      throw new Error("Failed to translate page using Gemini.");
    }
  }
  
  return "Error: Failed to process page after multiple attempts.";
};