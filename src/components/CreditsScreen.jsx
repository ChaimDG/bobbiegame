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
        <dl>
          <div>
            <dt>Creative direction</dt>
            <dd>ChaimDG</dd>
          </div>
          <div>
            <dt>Design &amp; development</dt>
            <dd>Bobbie Game</dd>
          </div>
          <div>
            <dt>Official playtester</dt>
            <dd>Bobbie</dd>
          </div>
        </dl>
      </section>
      <GameButton onClick={onBackToMenu} onPointerEnter={onHoverButton} size="small" tone="credits">
        Back to Menu
      </GameButton>
    </div>
  );
}
