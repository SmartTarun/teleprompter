
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { GEMINI_MODEL_FLASH } from '../constants';

// Helper to create a new Gemini client instance.
// This is crucial for environments like the AI Studio runtime where the API_KEY
// might be updated via a user dialog.
const getGeminiClient = () => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is not set. Please ensure it's available.");
    // In a real application, you might want to throw an error or handle this more gracefully
    // by guiding the user to select/set their key.
    throw new Error("Gemini API key is missing.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const summarizeScript = async (text: string): Promise<string> => {
  try {
    const ai = getGeminiClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_FLASH,
      contents: `Summarize the following script concisely, focusing on key points and main ideas. Aim for a summary that is about 1/4th the length of the original text, or a maximum of 200 words if the original is very long:
      \n\nScript:\n${text}`,
      config: {
        maxOutputTokens: 200,
        thinkingConfig: { thinkingBudget: 50 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing script with Gemini API:", error);
    throw new Error(`Failed to summarize script: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const translateScript = async (text: string, targetLanguage: string): Promise<string> => {
  try {
    const ai = getGeminiClient();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_FLASH,
      contents: `Translate the following script into ${targetLanguage}. Maintain the original formatting and tone as much as possible.
      \n\nScript:\n${text}`,
      config: {
        // Allowing a higher maxOutputTokens for translation, as it can be longer than summary
        maxOutputTokens: 1024,
        thinkingConfig: { thinkingBudget: 100 }
      }
    });
    return response.text;
  } catch (error) {
    console.error(`Error translating script to ${targetLanguage} with Gemini API:`, error);
    throw new Error(`Failed to translate script to ${targetLanguage}: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Function to check if the API key has been selected, as per Veo model guidance.
// This is a general check for the AI Studio environment.
export const ensureApiKeySelected = async (): Promise<boolean> => {
  if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.hasSelectedApiKey === 'function') {
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      console.warn('Gemini API key not selected. Opening key selection dialog.');
      // Assumed successful after opening the dialog for immediate UI update.
      // Actual key selection might be asynchronous and take time.
      await window.aistudio.openSelectKey();
      return true; // Assume success for UI flow
    }
    return true; // Key already selected
  }
  console.warn('window.aistudio API for key selection not available. Proceeding without explicit check.');
  return true; // In environments without aistudio, assume key is managed externally.
};
