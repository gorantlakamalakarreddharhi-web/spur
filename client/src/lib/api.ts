export type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
};

export type ChatResponse = {
    reply: string;
    sessionId: string;
    error?: string;
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    try {
        const res = await fetch(`${API_BASE}/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, sessionId }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to send message');
        }

        return await res.json();
    } catch (error: any) {
        throw new Error(error.message || 'Network error');
    }
}
