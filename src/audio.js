let audioContext;
let musicNodes;

function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
  }

  return audioContext;
}

export function createButtonSound() {
  return function playButtonSound(type) {
    if (typeof window === 'undefined' || (!window.AudioContext && !window.webkitAudioContext)) {
      return;
    }

    const context = getAudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    const startFrequency = type === 'hover' ? 560 : 320;
    const endFrequency = type === 'hover' ? 760 : 180;

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(startFrequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + 0.09);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(type === 'hover' ? 0.035 : 0.08, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.13);
  };
}

export function createLoopTone() {
  return {
    start() {
      if (musicNodes) {
        return;
      }

      if (typeof window === 'undefined' || (!window.AudioContext && !window.webkitAudioContext)) {
        return;
      }

      const context = getAudioContext();
      if (context.state === 'suspended') {
        context.resume();
      }
      const gain = context.createGain();
      const oscillator = context.createOscillator();

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(220, context.currentTime);
      gain.gain.setValueAtTime(0.012, context.currentTime);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      musicNodes = { gain, oscillator };
    },
    stop() {
      if (!musicNodes || !audioContext) {
        return;
      }

      musicNodes.gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + 0.08,
      );
      musicNodes.oscillator.stop(audioContext.currentTime + 0.1);
      musicNodes = null;
    },
  };
}

export function createGameSound() {
  return function playGameSound(name) {
    if (typeof window === 'undefined' || (!window.AudioContext && !window.webkitAudioContext)) {
      return;
    }

    const context = getAudioContext();
    if (context.state === 'suspended') {
      context.resume();
    }

    const cue = {
      jump: [430, 690, 0.08, 0.045],
      dive: [260, 190, 0.06, 0.035],
      land: [180, 260, 0.09, 0.055],
      perfect: [520, 920, 0.16, 0.09],
      bone: [760, 1040, 0.1, 0.06],
      badLand: [160, 90, 0.14, 0.08],
    }[name] || [220, 330, 0.08, 0.04];
    const [start, end, duration, volume] = cue;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = name === 'badLand' ? 'sawtooth' : 'triangle';
    oscillator.frequency.setValueAtTime(start, now);
    oscillator.frequency.exponentialRampToValueAtTime(end, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.014);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.05);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.06);
  };
}
