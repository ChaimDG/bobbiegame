import { GameButton } from './GameButton.jsx';
import bobbieDogUrl from '../assets/bobbie-dog.png';
import { defenseAssetUrls } from '../defense/assets.js';
import { wingsAssetUrls } from '../game/wingsAssets.js';
import { matchAssetUrls } from '../match/matchAssets.js';
import { jumpAssetUrls } from '../jump/assets.js';

const modes = [
  {
    id: 'bobbie-wings',
    name: 'Bobbie Wings',
    description: 'Dive, glide and surf rolling hills with perfect timing.',
    category: 'Sky Run',
    available: true,
    illustration: 'wings',
  },
  {
    id: 'bobbie-match',
    name: 'Bobbie Match',
    description: 'Swap treats, toys and paws to clear the goal.',
    category: 'Puzzle Picnic',
    available: true,
    illustration: 'match',
  },
  {
    id: 'bobbie-defense',
    name: 'Bobbie Defense',
    description: 'Build doggy towers and stop toy troublemakers.',
    category: 'Park Defense',
    available: true,
    illustration: 'defense',
  },
  {
    id: 'bobbie-jump',
    name: 'Bobbie Jump',
    description: 'Bounce up through the sky park and catch golden bones.',
    category: 'Sky Playground',
    available: true,
    illustration: 'jump',
  },
];

export function GameModeSelect({
  onBackToMenu,
  onStartBobbieWings,
  onStartBobbieMatch,
  onStartBobbieDefense,
  onStartBobbieJump,
  onHoverButton,
}) {
  return (
    <div className="mode-select mode-select-polished menu-enter" aria-labelledby="mode-select-title">
      <header className="mode-select-header">
        <button className="back-button mode-back-button" type="button" onClick={onBackToMenu}>
          Back
        </button>
        <div className="mode-select-heading">
          <span className="mode-select-kicker">Bobbie Game</span>
          <h1 className="panel-title" id="mode-select-title">
            Choose a Game
          </h1>
        </div>
        <span className="mode-select-paw" aria-hidden="true" />
      </header>
      <div className="mode-card-list">
        {modes.map((mode) => (
          <article
            className={`mode-card mode-card-${mode.illustration} ${!mode.available ? 'mode-card-locked' : ''}`}
            key={mode.id}
          >
            <ModeIllustration type={mode.illustration} />
            <div className="mode-card-copy">
              <span className="mode-card-category">{mode.category}</span>
              <h2>{mode.name}</h2>
              <p>{mode.description}</p>
            </div>
            {mode.available ? (
              <GameButton
                onClick={getModeAction(mode.id, {
                  onStartBobbieWings,
                  onStartBobbieMatch,
                  onStartBobbieDefense,
                  onStartBobbieJump,
                })}
                onPointerEnter={onHoverButton}
                size="mini"
              >
                Play
              </GameButton>
            ) : (
              <span className="coming-soon">Coming Soon</span>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function ModeIllustration({ type }) {
  const background = getModeBackground(type);

  return (
    <div
      className={`mode-illustration mode-illustration-${type}`}
      style={{ '--mode-scene': `url(${background})` }}
      aria-hidden="true"
    >
      <span className="mode-art-shine" />
      {type === 'wings' && <img className="mode-wings-bobbie" src={bobbieDogUrl} alt="" />}
      {type === 'match' && (
        <div className="mode-match-pieces" style={{ '--match-items-sprite': `url(${matchAssetUrls.items})` }}>
          <span className="mode-match-piece mode-match-piece-bone" />
          <span className="mode-match-piece mode-match-piece-ball" />
          <span className="mode-match-piece mode-match-piece-star" />
        </div>
      )}
      {type === 'defense' && (
        <>
          <img className="mode-defense-tower" src={defenseAssetUrls.tennis} alt="" />
          <img className="mode-defense-enemy" src={defenseAssetUrls.troublemaker} alt="" />
        </>
      )}
      {type === 'jump' && (
        <>
          <span className="mode-jump-platform" />
          <img className="mode-jump-bobbie" src={bobbieDogUrl} alt="" />
        </>
      )}
    </div>
  );
}

function getModeBackground(type) {
  if (type === 'match') {
    return matchAssetUrls.garden;
  }
  if (type === 'defense') {
    return defenseAssetUrls.arena;
  }
  if (type === 'jump') {
    return jumpAssetUrls.skyPark;
  }
  return wingsAssetUrls.wingsValley;
}

function getModeAction(id, actions) {
  if (id === 'bobbie-match') {
    return actions.onStartBobbieMatch;
  }
  if (id === 'bobbie-defense') {
    return actions.onStartBobbieDefense;
  }
  if (id === 'bobbie-jump') {
    return actions.onStartBobbieJump;
  }
  return actions.onStartBobbieWings;
}
