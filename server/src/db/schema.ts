import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const conversations = sqliteTable('conversations', {
    id: text('id').primaryKey(), // UUID
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
    metadata: text('metadata'), // JSON string for any extra info
});

export const messages = sqliteTable('messages', {
    id: text('id').primaryKey(), // UUID
    conversationId: text('conversation_id').references(() => conversations.id).notNull(),
    role: text('role', { enum: ['user', 'assistant'] }).notNull(),
    content: text('content').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});
