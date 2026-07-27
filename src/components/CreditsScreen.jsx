import { GameButton } from './GameButton.jsx';
import snoetjesDogUrl from '../assets/snoetjes-dog.png';

export function CreditsScreen({ onBackToMenu, onHoverButton }) {
  return (
    <div className="menu-content credits-content menu-enter" aria-labelledby="credits-title">
      <div className="credits-snoetjes-stage" aria-hidden="true">
        <span className="credits-snoetjes-glow" />
        <img src={snoetjesDogUrl} className="credits-snoetjes" alt="" />
        <span className="credits-bone-mark credits-bone-mark-one" />
        <span className="credits-bone-mark credits-bone-mark-two" />
      </div>
      <header className="credits-heading">
        <span>Snoetjes Game</span>
        <h1 className="panel-title" id="credits-title">Credits</h1>
      </header>
      <section className="credits-card" aria-label="Game credits">
        <p className="credits-card-kicker">Made with care</p>
        <p className="credits-message">
          Dit spel is gemaakt door Chaim de Gelder, mede mogelijk gemaakt door Codex en een YouTube-tutorial over vibe coding.
        </p>
      </section>
      <GameButton onClick={onBackToMenu} onPointerEnter={onHoverButton} size="small" tone="credits">
        Back to Menu
      </GameButton>
    </div>
  );
}
