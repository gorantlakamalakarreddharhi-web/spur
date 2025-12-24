<script>
  import '../app.css';
</script>

<div class="layout">
  <main>
    <slot />
  </main>
</div>

<style>
  .layout {
    display: flex;
    justify-content: center;
    min-height: 100vh;
    padding: 1rem;
  }
  
  main {
    width: 100%;
    max-width: 480px; /* Mobile-first / Widget size */
    background: var(--color-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    overflow: hidden;
    height: 90vh; /* Fixed height for widget feel */
    display: flex;
    flex-direction: column;
    margin-top: 2rem;
  }
</style>
