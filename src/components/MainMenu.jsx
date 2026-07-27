import { GameButton } from './GameButton.jsx';
import snoetjesDogUrl from '../assets/snoetjes-dog.png';
import { wingsAssetUrls } from '../game/wingsAssets.js';

export function MainMenu({
  statusMessage,
  onNewGame,
  onOpenSettings,
  onCredits,
  onHoverButton,
}) {
  return (
    <div className="menu-content menu-content-premium menu-enter" aria-labelledby="main-menu-title">
      <div className="menu-character-stage" aria-hidden="true">
        <span className="menu-character-glow" />
        <span className="menu-character-grass" />
        <img className="menu-snoetjes" src={snoetjesDogUrl} alt="" />
        <img className="menu-gold-bone" src={wingsAssetUrls.goldBone} alt="" />
        <span className="menu-spark menu-spark-one" />
        <span className="menu-spark menu-spark-two" />
      </div>
      <div className="menu-logo-wrap">
        <span className="menu-logo-kicker">A Snoetjes Adventure</span>
        <h1 className="game-logo" id="main-menu-title">
          <span>Snoetjes</span>
          <span>Game</span>
        </h1>
      </div>
      <nav className="button-stack" aria-label="Hoofdmenu">
        <GameButton onClick={onNewGame} onPointerEnter={onHoverButton} tone="play">
          Play
        </GameButton>
        <GameButton onClick={onOpenSettings} onPointerEnter={onHoverButton} tone="options">
          Options
        </GameButton>
        <GameButton onClick={onCredits} onPointerEnter={onHoverButton} tone="credits">
          Credits
        </GameButton>
      </nav>
      {statusMessage ? <p className="status-bubble">{statusMessage}</p> : null}
    </div>
  );
}
