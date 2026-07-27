import { useState } from 'react';
import { createButtonSound, createLoopTone, createGameSound } from './audio.js';
import { BobbieWings } from './game/BobbieWings.jsx';
import { BobbieMatch } from './match/BobbieMatch.jsx';
import { BobbieDefense } from './defense/BobbieDefense.jsx';
import { BobbieJump } from './jump/BobbieJump.jsx';
import { MainMenu } from './components/MainMenu.jsx';
import { GameModeSelect } from './components/GameModeSelect.jsx';
import { SettingsScreen } from './components/SettingsScreen.jsx';
import { wingsAssetUrls } from './game/wingsAssets.js';

const buttonSound = createButtonSound();
const musicLoop = createLoopTone();
const gameSound = createGameSound();

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [audioSettings, setAudioSettings] = useState({
    music: true,
    sfx: true,
  });
  const [statusMessage, setStatusMessage] = useState('');

  function playHoverSound() {
    if (audioSettings.sfx) {
      buttonSound('hover');
    }
  }

  function playClickSound() {
    if (audioSettings.sfx) {
      buttonSound('click');
    }

    if (audioSettings.music) {
      musicLoop.start();
    }
  }

  function handleNewGame() {
    playClickSound();
    setStatusMessage('');
    setCurrentScreen('modes');
  }

  function handleCredits() {
    playClickSound();
    setStatusMessage('Credits komen later.');
  }

  function handleOpenSettings() {
    playClickSound();
    setStatusMessage('');
    setCurrentScreen('settings');
  }

  function handleBackToMenu() {
    playClickSound();
    setStatusMessage('');
    setCurrentScreen('menu');
  }

  function handleOpenModes() {
    playClickSound();
    setStatusMessage('');
    setCurrentScreen('modes');
  }

  function handleStartBobbieWings() {
    playClickSound();
    setStatusMessage('');
    setCurrentScreen('bobbie-wings');
  }

  function handleStartBobbieMatch() {
    playClickSound();
    setStatusMessage('');
    setCurrentScreen('bobbie-match');
  }

  function handleStartBobbieDefense() {
    playClickSound();
    setStatusMessage('');
    setCurrentScreen('bobbie-defense');
  }

  function handleStartBobbieJump() {
    playClickSound();
    setStatusMessage('');
    setCurrentScreen('bobbie-jump');
  }

  function handleAudioChange(key, enabled) {
    setAudioSettings((settings) => ({
      ...settings,
      [key]: enabled,
    }));

    if (key === 'music' && !enabled) {
      musicLoop.stop();
    }
  }

  if (currentScreen === 'bobbie-wings') {
    return (
      <BobbieWings
        audioSettings={audioSettings}
        onBackToModes={handleOpenModes}
        onMainMenu={handleBackToMenu}
        playGameSound={gameSound}
      />
    );
  }

  if (currentScreen === 'bobbie-match') {
    return (
      <BobbieMatch
        onBackToModes={handleOpenModes}
        onMainMenu={handleBackToMenu}
      />
    );
  }

  if (currentScreen === 'bobbie-defense') {
    return (
      <BobbieDefense
        onBackToModes={handleOpenModes}
        onMainMenu={handleBackToMenu}
      />
    );
  }

  if (currentScreen === 'bobbie-jump') {
    return (
      <BobbieJump
        onBackToModes={handleOpenModes}
        onMainMenu={handleBackToMenu}
      />
    );
  }

  return (
    <main
      className={`game-shell${currentScreen === 'menu' ? ' game-shell-menu' : ''}`}
      style={currentScreen === 'menu' ? { '--menu-valley': `url(${wingsAssetUrls.wingsValley})` } : undefined}
    >
      <div className="sky-layer sky-layer-back" aria-hidden="true" />
      <div className="sky-layer sky-layer-front" aria-hidden="true" />
      {currentScreen !== 'menu' && <DogDecorations />}
      <section className="menu-stage" aria-live="polite">
        {currentScreen === 'menu' && (
          <MainMenu
            statusMessage={statusMessage}
            onNewGame={handleNewGame}
            onOpenSettings={handleOpenSettings}
            onCredits={handleCredits}
            onHoverButton={playHoverSound}
          />
        )}
        {currentScreen === 'modes' && (
          <GameModeSelect
            onBackToMenu={handleBackToMenu}
            onStartBobbieWings={handleStartBobbieWings}
            onStartBobbieMatch={handleStartBobbieMatch}
            onStartBobbieDefense={handleStartBobbieDefense}
            onStartBobbieJump={handleStartBobbieJump}
            onHoverButton={playHoverSound}
          />
        )}
        {currentScreen === 'settings' && (
          <SettingsScreen
            audioSettings={audioSettings}
            onAudioChange={handleAudioChange}
            onBackToMenu={handleBackToMenu}
            onHoverButton={playHoverSound}
          />
        )}
      </section>
      <p className="version-label">v0.1</p>
    </main>
  );
}

function DogDecorations() {
  return (
    <div className="decor-layer" aria-hidden="true">
      <span className="cloud cloud-one" />
      <span className="cloud cloud-two" />
      <span className="cloud cloud-three" />
      <span className="bird bird-one">m</span>
      <span className="bird bird-two">m</span>
      <span className="paw paw-one">oo</span>
      <span className="paw paw-two">oo</span>
      <span className="paw paw-three">oo</span>
      <span className="bone bone-one" />
      <span className="bone bone-two" />
      <span className="ball ball-one" />
      <span className="treat treat-one" />
      <span className="tail-wag" />
      <span className="sparkle sparkle-one" />
      <span className="sparkle sparkle-two" />
      <span className="grass grass-left" />
      <span className="grass grass-right" />
    </div>
  );
}
