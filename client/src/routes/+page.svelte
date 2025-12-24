<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import { sendMessage, type ChatMessage } from '$lib/api';

  let input = '';
  let messages: ChatMessage[] = [];
  let isLoading = false;
  let sessionId: string | undefined = undefined;
  let chatContainer: HTMLElement;
  let error: string | null = null;

  onMount(() => {
    const storedSession = localStorage.getItem('spur_session_id');
    if (storedSession) {
      sessionId = storedSession;
      // TODO: Fetch history if needed, for now we start fresh or rely on memory if we implements history fetch
    }
    
    // Welcome message
    messages = [{ role: 'assistant', content: "Hi! I'm your Spur support assistant. How can I help you today?" }];
  });

  afterUpdate(() => {
    scrollToBottom();
  });

  function scrollToBottom() {
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  async function handleSubmit() {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    input = '';
    error = null;

    // Optimistic update
    messages = [...messages, { role: 'user', content: userMsg }];
    isLoading = true;

    try {
      const response = await sendMessage(userMsg, sessionId);
      
      if (response.sessionId) {
        sessionId = response.sessionId;
        localStorage.setItem('spur_session_id', sessionId);
      }

      messages = [...messages, { role: 'assistant', content: response.reply }];
    } catch (err: any) {
      error = err.message;
      // Remove user message if failed? Or just show error?
      // For now, keep user message but show error toast/alert below
    } finally {
      isLoading = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }
</script>

<div class="chat-container">
  <header>
    <h1>Spur Support</h1>
    <span class="status-dot"></span>
  </header>

  <div class="messages" bind:this={chatContainer}>
    {#each messages as msg}
      <div class="message-wrapper {msg.role}">
        <div class="message-bubble">
          {msg.content}
        </div>
        <span class="role-label">{msg.role === 'user' ? 'You' : 'Agent'}</span>
      </div>
    {/each}

    {#if isLoading}
      <div class="message-wrapper assistant">
        <div class="message-bubble typing">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        </div>
      </div>
    {/if}

    {#if error}
        <div class="error-banner">
            {error}
        </div>
    {/if}
  </div>

  <div class="input-area">
    <textarea
      bind:value={input}
      on:keydown={handleKeydown}
      placeholder="Type your question..."
      rows="1"
    ></textarea>
    <button on:click={handleSubmit} disabled={isLoading || !input.trim()}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
    </button>
  </div>
</div>

<style>
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #fff;
  }

  header {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255,255,255,0.8);
    backdrop-filter: blur(10px);
  }

  h1 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    background: #10b981;
    border-radius: 50%;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .message-wrapper {
    display: flex;
    flex-direction: column;
    max-width: 85%;
    gap: 0.25rem;
  }

  .message-wrapper.user {
    align-self: flex-end;
    align-items: flex-end;
  }

  .message-wrapper.assistant {
    align-self: flex-start;
    align-items: flex-start;
  }

  .message-bubble {
    padding: 0.75rem 1rem;
    border-radius: var(--radius-lg);
    font-size: 0.9375rem;
    line-height: 1.5;
    position: relative;
    word-break: break-word;
  }

  .message-wrapper.user .message-bubble {
    background: var(--color-message-user);
    color: white;
    border-bottom-right-radius: 2px;
  }

  .message-wrapper.assistant .message-bubble {
    background: var(--color-message-bot);
    color: var(--color-text);
    border-bottom-left-radius: 2px;
  }

  .role-label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin: 0 0.25rem;
  }

  .input-area {
    padding: 1rem;
    border-top: 1px solid var(--color-border);
    display: flex;
    gap: 0.75rem;
    background: #fff;
  }

  textarea {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    resize: none;
    outline: none;
    transition: border-color 0.2s;
    height: 46px; /* Match button height roughly */
  }

  textarea:focus {
    border-color: var(--color-primary);
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 46px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    transition: background 0.2s, opacity 0.2s;
  }

  button:hover:not(:disabled) {
    background: var(--color-primary-hover);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Typing animation */
  .typing {
    display: flex;
    gap: 4px;
    padding: 1rem;
  }
  
  .dot {
    width: 6px;
    height: 6px;
    background: #94a3b8;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;
  }
  
  .dot:nth-child(1) { animation-delay: -0.32s; }
  .dot:nth-child(2) { animation-delay: -0.16s; }
  
  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }

  .error-banner {
    padding: 0.5rem;
    background: #fee2e2;
    color: #991b1b;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    text-align: center;
    margin-top: 1rem;
  }
</style>
