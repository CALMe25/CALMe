/**
 * Play a quiet alert tone using Web Audio API.
 * Two-tone beep pattern inspired by civil defense alerts, kept short and soft.
 * No audio files needed — works fully offline.
 */
export function playAlertSound(volume = 0.15): void {
  try {
    const ctx = new AudioContext();
    const gainNode = ctx.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(ctx.destination);

    // First tone: 800Hz for 300ms
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.value = 800;
    osc1.connect(gainNode);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);

    // Brief pause, then second tone: 600Hz for 300ms
    const osc2 = ctx.createOscillator();
    osc2.type = "sine";
    osc2.frequency.value = 600;
    osc2.connect(gainNode);
    osc2.start(ctx.currentTime + 0.4);
    osc2.stop(ctx.currentTime + 0.7);

    // Cleanup after done
    osc2.onended = () => {
      gainNode.disconnect();
      void ctx.close();
    };
  } catch {
    // Web Audio not available — silent fallback
  }
}
