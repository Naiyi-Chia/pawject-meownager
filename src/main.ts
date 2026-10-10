import { mountShell } from './ui/shell';
import './ui/styles.css';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('App mount element is missing.');

const { gameHost, setRuntimeStatus } = mountShell(app);

// Keep the HTML shell readable while the game runtime loads.
const { mountGame } = await import('./game/mountGame');
const game = mountGame(gameHost, () =>
  setRuntimeStatus('Placeholder scene ready'),
);

if (import.meta.hot) {
  import.meta.hot.dispose(() => game.destroy(true));
}
