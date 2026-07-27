export function attachInput(input, target) {
  function press(event) {
    if (event.code === 'Space' || event.pointerType || event.type === 'touchstart') {
      event.preventDefault();
    }

    if (!input.pressed) {
      input.justPressed = true;
    }
    input.pressed = true;
  }

  function release(event) {
    if (event.code === 'Space' || event.pointerType || event.type === 'touchend') {
      event.preventDefault();
    }

    if (input.pressed) {
      input.justReleased = true;
    }
    input.pressed = false;
  }

  target.addEventListener('pointerdown', press);
  window.addEventListener('pointerup', release);
  target.addEventListener('touchstart', press, { passive: false });
  window.addEventListener('touchend', release, { passive: false });
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  function handleKeyDown(event) {
    if (event.code === 'Space') {
      press(event);
    }
  }

  function handleKeyUp(event) {
    if (event.code === 'Space') {
      release(event);
    }
  }

  return () => {
    target.removeEventListener('pointerdown', press);
    window.removeEventListener('pointerup', release);
    target.removeEventListener('touchstart', press);
    window.removeEventListener('touchend', release);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
}
