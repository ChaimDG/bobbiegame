import { useState } from 'react';
import { createButtonSound, createLoopTone, createGameSound } from './audio.js';
import { SnoetjesWings } from './game/SnoetjesWings.jsx';
import { SnoetjesMatch } from './match/SnoetjesMatch.jsx';
import { SnoetjesDefense } from './defense/SnoetjesDefense.jsx';
import { SnoetjesJump } from './jump/SnoetjesJump.jsx';
import { MainMenu } from './components/MainMenu.jsx';
import { GameModeSelect } from './components/GameModeSelect.jsx';
import { SettingsScreen } from './components/SettingsScreen.jsx';
import { CreditsScreen } from './components/CreditsScreen.jsx';
import { screenAssetUrls } from './components/screenAssets.js';
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
    setStatusMessage('');
    setCurrentScreen('credits');
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

  function handleStartSnoetjesWings() {
    playClickSound();
    setStatusMessage('');
    setCurrentScreen('snoetjes-wings');
  }

  function handleStartSnoetjesMatch() {
    playClickSound();
    setStatusMessage('');
    setCurrentScreen('snoetjes-match');
  }

  function handleStartSnoetjesDefense() {
    playClickSound();
    setStatusMessage('');
    setCurrentScreen('snoetjes-defense');
  }

  function handleStartSnoetjesJump() {
    playClickSound();
    setStatusMessage('');
    setCurrentScreen('snoetjes-jump');
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

  if (currentScreen === 'snoetjes-wings') {
    return (
      <SnoetjesWings
        audioSettings={audioSettings}
        onBackToModes={handleOpenModes}
        onMainMenu={handleBackToMenu}
        playGameSound={gameSound}
      />
    );
  }

  if (currentScreen === 'snoetjes-match') {
    return (
      <SnoetjesMatch
        onBackToModes={handleOpenModes}
        onMainMenu={handleBackToMenu}
      />
    );
  }

  if (currentScreen === 'snoetjes-defense') {
    return (
      <SnoetjesDefense
        onBackToModes={handleOpenModes}
        onMainMenu={handleBackToMenu}
      />
    );
  }

  if (currentScreen === 'snoetjes-jump') {
    return (
      <SnoetjesJump
        onBackToModes={handleOpenModes}
        onMainMenu={handleBackToMenu}
      />
    );
  }

  return (
    <main
      className={`game-shell${getScreenShellClass(currentScreen)}`}
      style={getScreenBackground(currentScreen)}
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
            onStartSnoetjesWings={handleStartSnoetjesWings}
            onStartSnoetjesMatch={handleStartSnoetjesMatch}
            onStartSnoetjesDefense={handleStartSnoetjesDefense}
            onStartSnoetjesJump={handleStartSnoetjesJump}
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
        {currentScreen === 'credits' && (
          <CreditsScreen
            onBackToMenu={handleBackToMenu}
            onHoverButton={playHoverSound}
          />
        )}
      </section>
      <p className="version-label">v0.1</p>
    </main>
  );
}

function getScreenShellClass(screen) {
  if (screen === 'menu') {
    return ' game-shell-menu';
  }
  if (screen === 'settings') {
    return ' game-shell-settings';
  }
  if (screen === 'credits') {
    return ' game-shell-credits';
  }
  return '';
}

function getScreenBackground(screen) {
  if (screen === 'menu') {
    return { '--menu-valley': `url(${wingsAssetUrls.wingsValley})` };
  }
  if (screen === 'settings') {
    return { '--settings-garden': `url(${screenAssetUrls.optionsGarden})` };
  }
  if (screen === 'credits') {
    return { '--credits-meadow': `url(${screenAssetUrls.creditsMeadow})` };
  }
  return undefined;
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
