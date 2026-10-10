export function mountShell(app: HTMLElement) {
  app.innerHTML = `
    <main class="shell">
      <header class="intro">
        <p class="eyebrow">EARTH–MEOW JOINT MISSION OFFICE</p>
        <h1>Pawject<br />Meownager<span aria-hidden="true">.</span></h1>
        <p class="subtitle">A little mission. A lot of cats.</p>
      </header>
      <section class="scene-card" aria-labelledby="scene-heading">
        <div class="scene-heading">
          <h2 id="scene-heading">Mission base</h2>
          <span class="badge">Foundation preview</span>
        </div>
        <div id="game-host" class="game-host" role="img"
          aria-label="Static placeholder pixel cat at a mission base. No gameplay controls."></div>
        <p class="runtime-status" role="status">Loading placeholder scene…</p>
      </section>
      <p class="preview-note">The cats are waiting for their story.<br />This preview shows the app shell only.</p>
      <footer>Project Meow Homecoming <span aria-hidden="true">/</span> 喵星返航計畫</footer>
    </main>
  `;

  const gameHost = app.querySelector<HTMLDivElement>('#game-host')!;
  const status = app.querySelector<HTMLParagraphElement>('.runtime-status')!;

  return {
    gameHost,
    setRuntimeStatus(message: string) {
      status.textContent = message;
    },
  };
}
