import { GameButton } from './GameButton.jsx';

export function SettingsScreen({
  audioSettings,
  onAudioChange,
  onBackToMenu,
  onHoverButton,
}) {
  return (
    <div className="menu-content settings-content menu-enter" aria-labelledby="settings-title">
      <h1 className="panel-title" id="settings-title">
        Options
      </h1>
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
      <GameButton onClick={onBackToMenu} onPointerEnter={onHoverButton} size="small">
        Back
      </GameButton>
    </div>
  );
}
