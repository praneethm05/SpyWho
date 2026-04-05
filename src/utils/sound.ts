import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

export const SoundAssets = {
  click: require('../../assets/audio/click_sound.mp3'),
  reveal: require('../../assets/audio/reveal_sound.mp3'),
  alarm: require('../../assets/audio/alarm_sound.mp3'),
};

// Global persistent players
let clickPlayer: any = null;
let revealPlayer: any = null;
let alarmPlayer: any = null;

/**
 * Initialize persistent players to ensure zero latency.
 */
export async function initSounds() {
  try {
    console.log('--- [SOUND] INITIALIZING ENGINE ---');
    await setAudioModeAsync({
      shouldPlayInBackground: true,
      playsInSilentMode: true,
    });
    console.log('--- [SOUND] ENGINE MODES APPLIED ---');

    if (!clickPlayer) clickPlayer = createAudioPlayer(SoundAssets.click);
    if (!revealPlayer) revealPlayer = createAudioPlayer(SoundAssets.reveal);
    if (!alarmPlayer) {
      alarmPlayer = createAudioPlayer(SoundAssets.alarm);
      alarmPlayer.loop = true;
    }
    console.log('--- [SOUND] REVEAL/ALARM PLAYERS READY ---');
  } catch (error) {
    console.error('expo-audio init error:', error);
    // Try to create players anyway as a fallback
    if (!clickPlayer) clickPlayer = createAudioPlayer(SoundAssets.click);
    if (!revealPlayer) revealPlayer = createAudioPlayer(SoundAssets.reveal);
    if (!alarmPlayer) {
      alarmPlayer = createAudioPlayer(SoundAssets.alarm);
      alarmPlayer.loop = true;
    }
  }
}

/**
 * Play click sound instantly.
 */
export function playClickSound() {
  try {
    if (clickPlayer) {
      clickPlayer.seekTo(0);
      clickPlayer.play();
    }
  } catch (error) {
    console.error('expo-audio click error:', error);
  }
}

/**
 * Play reveal sound instantly.
 */
export function playRevealSound() {
  try {
    if (revealPlayer) {
      revealPlayer.seekTo(0);
      revealPlayer.play();
    }
  } catch (error) {
    console.error('expo-audio reveal error:', error);
  }
}

/**
 * Start looping alarm.
 */
export function startAlarm() {
  try {
    console.log('--- [HARDWARE] TRIGGERING ALARM PLAYBACK ---');
    if (!alarmPlayer) {
      console.log('--- [HARDWARE] ERROR: ALARM PLAYER MISSING - FORCING REBUILD ---');
      alarmPlayer = createAudioPlayer(SoundAssets.alarm);
      alarmPlayer.loop = true;
    }
    alarmPlayer.volume = 1.0;
    alarmPlayer.loop = true;
    alarmPlayer.seekTo(0);
    alarmPlayer.play();
    console.log('--- [HARDWARE] ALARM PLAY COMMAND SENT ---');
  } catch (error) {
    console.error('--- [HARDWARE] EXPO-AUDIO START ALARM ERROR ---', error);
  }
}

/**
 * Stop alarm and release resources.
 */
export function stopAlarm() {
  try {
    if (alarmPlayer) {
      alarmPlayer.pause();
      alarmPlayer.seekTo(0);
    }
  } catch (error) {
    console.error('expo-audio stop alarm error:', error);
  }
}
