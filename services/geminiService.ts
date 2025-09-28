import { GoogleGenAI } from "@google/genai";
import type { Note } from "../types";

// Fix: Per coding guidelines, initialize GoogleGenAI with API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

class GeminiService {
  async generateTextForNote(prompt: string, noteContent: string): Promise<string> {
    // Fix: Removed hardcoded API key check. The key is now handled via environment variables.
    try {
      const fullPrompt = `You are an AI assistant helping a user with their note. Perform the following task: "${prompt}".\n\nHere is the current content of the note:\n---\n${noteContent}\n---\n\nProvide only the generated text to be added or replaced in the note.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
      });

      return response.text;
    } catch (error) {
      console.error("Error generating text for note:", error);
      return "Sorry, I couldn't generate a response. Please try again.";
    }
  }

  async generateReplacementTextForNote(prompt: string, noteContent: string): Promise<string> {
    // Fix: Removed hardcoded API key check. The key is now handled via environment variables.
    try {
      const fullPrompt = `You are an AI assistant that rewrites or summarizes a user's note based on their request. Your output should be ONLY the new, full text for the note. Do not include any titles, headings, or conversational pleasantries like "Here is the summary:". Just provide the raw text that will replace the old note content.

User's Task: "${prompt}"

Original Note Content:
---
${noteContent}
---

New Note Content:`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
      });

      return response.text;
    } catch (error)      {
      console.error("Error generating replacement text for note:", error);
      return "Sorry, I couldn't generate a response. Please try again.";
    }
  }

  async generateInitialNoteContent(title: string, content: string): Promise<string> {
    // Fix: Removed hardcoded API key check. The key is now handled via environment variables.
    try {
      const prompt = `You are an AI assistant helping a user draft a new note. Based on the provided title and initial content/prompt, please generate the body of the note. 
      If the content looks like a prompt, fulfill it. If it's just a few keywords, expand on them.
      
      Title: "${title}"
      Initial Content/Prompt: "${content}"
      
      Respond with only the generated content for the note body. Do not include the title in your response.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("Error generating initial note content:", error);
      return "Sorry, I couldn't generate a response. Please try again.";
    }
  }

  async answerQuestionFromNotes(question: string, notes: Note[]): Promise<string> {
    // Fix: Removed hardcoded API key check. The key is now handled via environment variables.
    try {
      const context = notes
        .map(note => `Note Title: ${note.title}\nNote Content: ${note.content}`)
        .join('\n\n---\n\n');

      const prompt = `You are an AI assistant that answers questions based on a user's personal notes. The user's notes are provided below as context. Answer the user's question based *only* on the information in these notes. If the answer isn't in the notes, say that you can't find the information in their notes.\n\n--- CONTEXT: USER'S NOTES ---\n${context}\n\n--- END OF CONTEXT ---\n\nUSER'S QUESTION: ${question}\n\nANSWER:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      return response.text;
    } catch (error) {
      console.error("Error answering question from notes:", error);
      return "Sorry, I couldn't generate a response. Please try again.";
    }
  }
}

export const geminiService = new GeminiService();