/**
 * ஸ்ரீ ஐஸ்வர்யம் யோகா - பிராணாயாமம் மூச்சுப் பயிற்சி வழிகாட்டி
 * Aiswaryam Yoga - Interactive Pranayama Breathing Guide
 */

document.addEventListener('DOMContentLoaded', () => {
  const circle = document.getElementById('pranayamaCircle');
  const stateLabel = document.getElementById('breathStateText');
  const countLabel = document.getElementById('breathTimerCount');
  const startBtn = document.getElementById('breathStartBtn');
  const resetBtn = document.getElementById('breathResetBtn');

  if (!circle || !stateLabel || !countLabel || !startBtn) return;

  // Box Breathing cycle: Inhale (4s) -> Hold (4s) -> Exhale (4s) -> Hold (4s)
  const phases = [
    { nameTa: 'மூச்சை உள்ளிழுக்கவும்', nameEn: 'Inhale Gently', duration: 4, scale: 1.35, color: '#234A3B' },
    { nameTa: 'மூச்சை அடக்கவும் (கும்பகம்)', nameEn: 'Hold Breath', duration: 4, scale: 1.35, color: '#A35438' },
    { nameTa: 'மூச்சை வெளியிடவும் (ரேசகம்)', nameEn: 'Exhale Slowly', duration: 4, scale: 1.0, color: '#2563EB' },
    { nameTa: 'இயல்பு நிலை (சூன்யகம்)', nameEn: 'Rest & Be Still', duration: 4, scale: 1.0, color: '#7C3AED' }
  ];

  let isRunning = false;
  let currentPhaseIndex = 0;
  let remainingSeconds = 4;
  let intervalId = null;

  function updateDisplay() {
    const lang = document.documentElement.getAttribute('lang') || 'ta';
    const phase = phases[currentPhaseIndex];
    stateLabel.textContent = lang === 'ta' ? phase.nameTa : phase.nameEn;
    countLabel.textContent = remainingSeconds;
    circle.style.transform = `scale(${phase.scale})`;
    circle.style.background = `radial-gradient(circle, ${phase.color}, #0F172A)`;
  }

  function tick() {
    remainingSeconds--;
    if (remainingSeconds <= 0) {
      currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
      remainingSeconds = phases[currentPhaseIndex].duration;
      // Play subtle chime on phase shift if available
      if (window.AiswaryamYoga && window.AiswaryamYoga.playTibetanSingingBowl && currentPhaseIndex === 0) {
        // subtle chime every full cycle
      }
    }
    updateDisplay();
  }

  startBtn.addEventListener('click', () => {
    const lang = document.documentElement.getAttribute('lang') || 'ta';
    if (!isRunning) {
      isRunning = true;
      startBtn.textContent = lang === 'ta' ? 'நிறுத்து (Pause)' : 'Pause';
      startBtn.style.background = '#DC2626';
      updateDisplay();
      intervalId = setInterval(tick, 1000);
    } else {
      isRunning = false;
      startBtn.textContent = lang === 'ta' ? 'தொடங்கு (Start)' : 'Start';
      startBtn.style.background = '';
      clearInterval(intervalId);
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const lang = document.documentElement.getAttribute('lang') || 'ta';
      isRunning = false;
      clearInterval(intervalId);
      currentPhaseIndex = 0;
      remainingSeconds = 4;
      startBtn.textContent = lang === 'ta' ? 'தொடங்கு (Start)' : 'Start';
      startBtn.style.background = '';
      circle.style.transform = 'scale(1)';
      circle.style.background = 'radial-gradient(circle, #4E7D6A, #234A3B)';
      stateLabel.textContent = lang === 'ta' ? 'தொடங்கத் தயார்' : 'Ready to Begin';
      countLabel.textContent = '4';
    });
  }
});
