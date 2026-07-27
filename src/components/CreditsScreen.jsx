import { GameButton } from './GameButton.jsx';
import bobbieDogUrl from '../assets/bobbie-dog.png';

export function CreditsScreen({ onBackToMenu, onHoverButton }) {
  return (
    <div className="menu-content credits-content menu-enter" aria-labelledby="credits-title">
      <div className="credits-bobbie-stage" aria-hidden="true">
        <span className="credits-bobbie-glow" />
        <img src={bobbieDogUrl} className="credits-bobbie" alt="" />
        <span className="credits-bone-mark credits-bone-mark-one" />
        <span className="credits-bone-mark credits-bone-mark-two" />
      </div>
      <header className="credits-heading">
        <span>Bobbie Game</span>
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
