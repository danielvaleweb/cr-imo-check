export const playAlertSound = () => {
  try {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.volume = 0.4;
    audio.play().catch(e => console.warn('Audio play failed:', e));
  } catch (e) {
    console.error('Error playing sound:', e);
  }
};
