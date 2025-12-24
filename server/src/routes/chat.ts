import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { conversations, messages } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateReply, ChatMessage } from '../services/llm';

const router = Router();

// Schema for input validation
const chatMessageSchema = z.object({
    message: z.string().min(1, "Message cannot be empty").max(2000, "Message too long"),
    sessionId: z.string().uuid().optional(),
});

router.post('/message', async (req, res) => {
    try {
        const result = chatMessageSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({ error: result.error.issues[0].message });
        }

        const { message: userText, sessionId: providedSessionId } = result.data;
        let sessionId = providedSessionId;

        // 1. Create session if needed
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            await db.insert(conversations).values({
                id: sessionId,
                metadata: JSON.stringify({ source: 'web-widget' }),
            });
        } else {
            // Verify session exists
            const existing = await db.select().from(conversations).where(eq(conversations.id, sessionId));
            if (existing.length === 0) {
                // If invalid session, create a new one (silent recovery)
                sessionId = crypto.randomUUID();
                await db.insert(conversations).values({
                    id: sessionId,
                    metadata: JSON.stringify({ source: 'web-widget-recovered' }),
                });
            }
        }

        // 2. Fetch recent history for context (limit to last 10 messages)
        const historyData = await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, sessionId))
            .orderBy(desc(messages.createdAt))
            .limit(10); // Last 10 messages

        // Reverse to chronological order
        const history: ChatMessage[] = historyData.reverse().map((m: typeof messages.$inferSelect) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content
        }));

        // 3. Save User Message
        await db.insert(messages).values({
            id: crypto.randomUUID(),
            conversationId: sessionId,
            role: 'user',
            content: userText,
        });

        // 4. Generate AI Reply
        const aiReply = await generateReply(history, userText);

        // 5. Save AI Message
        await db.insert(messages).values({
            id: crypto.randomUUID(),
            conversationId: sessionId,
            role: 'assistant',
            content: aiReply,
        });

        // 6. Return response
        res.json({
            reply: aiReply,
            sessionId: sessionId
        });

    } catch (error) {
        console.error('Chat endpoint error:', error);
        res.status(500).json({ error: 'Internal server error processing your message.' });
    }
});

// Optional: Get history
router.get('/history/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    try {
        const history = await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, sessionId))
            .orderBy(messages.createdAt);

        res.json({ history });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

export default router;
