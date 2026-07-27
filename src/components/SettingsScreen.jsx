import { GameButton } from './GameButton.jsx';

export function SettingsScreen({
  audioSettings,
  onAudioChange,
  onBackToMenu,
  onHoverButton,
}) {
  return (
    <div className="menu-content settings-content settings-content-premium menu-enter" aria-labelledby="settings-title">
      <header className="settings-heading">
        <span>Snoetjes Game</span>
        <h1 className="panel-title" id="settings-title">Options</h1>
      </header>
      <section className="settings-card" aria-label="Audio settings">
        <p className="settings-card-kicker">Sound</p>
        <label className="sound-toggle">
          <span>Music</span>
          <input
            type="checkbox"
            checked={audioSettings.music}
            onChange={(event) => onAudioChange('music', event.target.checked)}
          />
          <span className="toggle-track">
            <span className="toggle-thumb" />
          </span>
        </label>
        <label className="sound-toggle">
          <span>SFX</span>
          <input
            type="checkbox"
            checked={audioSettings.sfx}
            onChange={(event) => onAudioChange('sfx', event.target.checked)}
          />
          <span className="toggle-track">
            <span className="toggle-thumb" />
          </span>
        </label>
      </section>
      <GameButton onClick={onBackToMenu} onPointerEnter={onHoverButton} size="small" tone="options">
        Back
      </GameButton>
    </div>
  );
}
