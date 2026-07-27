export function GameButton({ children, onClick, onPointerEnter, size = 'large', tone = 'default' }) {
  return (
    <button
      className={`game-button game-button-${size} game-button-tone-${tone}`}
      type="button"
      onClick={onClick}
      onPointerEnter={onPointerEnter}
    >
      <span>{children}</span>
    </button>
  );
}
