import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `
You are a helpful customer support agent for "Spur Store", an online retailer of cool gadgets.
Your tone should be professional, friendly, and concise.

Key Information:
- Shipping: We ship to USA, Canada, and UK. Free shipping on orders over $50. Standard shipping takes 3-5 business days.
- Returns: 30-day return policy for unused items in original packaging. Customer pays return shipping unless item is defective.
- Support Hours: Mon-Fri, 9AM - 6PM EST.
- Contact: support@spurstore.com

Guidelines:
- If you don't know the answer, politely ask the user to contact support via email.
- Do not make up facts not present in this prompt.
- Keep answers short (under 3-4 sentences) effectively for chat.
`;

export type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
};

export async function generateReply(history: ChatMessage[], userMessage: string): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY not set, returning mock response');
        return "I'm a mock AI agent. Please configure the GEMINI_API_KEY to get real answers.";
    }

    console.log('Using Gemini API with key length:', (process.env.GEMINI_API_KEY || '').length);

    try {
        // User has access to gemini-2.5-flash
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: SYSTEM_PROMPT
        });

        // Format history for Gemini
        // Gemini history format: { role: 'user' | 'model', parts: [{ text: string }] }
        let chatHistory = history.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));

        // Gemini API requires the first message in the history to be from the user.
        // If the DB history starts with a model reply, we must prune it.
        while (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
            chatHistory.shift();
        }

        const chat = model.startChat({
            history: chatHistory
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return response.text();

    } catch (error) {
        console.error('LLM API Error:', error);
        return "I'm having trouble connecting to my brain right now. Please try again later.";
    }
}
