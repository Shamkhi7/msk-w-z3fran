// Web Audio API tactile sound synthesizer for POS cashier feedback

export const useAudioBeep = () => {
  const playTone = (freq, type = 'sine', duration = 0.08, gainVal = 0.15) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignore audio context errors if blocked by browser policy
    }
  };

  const playAddToCart = () => {
    // Quick pleasant high chirp
    playTone(880, 'sine', 0.06, 0.12);
  };

  const playRemoveItem = () => {
    // Quick lower click
    playTone(330, 'triangle', 0.08, 0.12);
  };

  const playSuccess = () => {
    // 2-tone melodic success chime
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const now = ctx.currentTime;
      [
        { f: 523.25, t: now, d: 0.1 },
        { f: 659.25, t: now + 0.08, d: 0.1 },
        { f: 783.99, t: now + 0.16, d: 0.15 },
        { f: 1046.50, t: now + 0.24, d: 0.25 },
      ].forEach(({ f, t, d }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + d);
      });
    } catch (e) {}
  };

  const playWarning = () => {
    playTone(220, 'sawtooth', 0.15, 0.1);
  };

  return {
    playAddToCart,
    playRemoveItem,
    playSuccess,
    playWarning,
  };
};
