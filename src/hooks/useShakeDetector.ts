/**
 * useShakeDetector — detects phone shakes via the Accelerometer.
 *
 * Counts discrete shake events and fires a callback when the threshold is met.
 * Includes debounce to prevent double-counting a single shake motion.
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { Accelerometer } from 'expo-sensors';

interface ShakeDetectorOptions {
  /** Number of shakes required to trigger onComplete */
  threshold: number;
  /** Callback fired when the shake count reaches the threshold */
  onComplete: () => void;
  /** Whether the detector is active (subscription is paused when false) */
  enabled: boolean;
  /** Acceleration magnitude threshold to count as a shake (in g). Default: 1.8 */
  sensitivity?: number;
  /** Minimum ms between counted shakes to debounce. Default: 400 */
  debounceDuration?: number;
}

interface ShakeDetectorResult {
  /** Current number of detected shakes */
  shakeCount: number;
  /** Reset the shake counter to 0 */
  resetShakeCount: () => void;
}

export function useShakeDetector({
  threshold,
  onComplete,
  enabled,
  sensitivity = 1.8,
  debounceDuration = 400,
}: ShakeDetectorOptions): ShakeDetectorResult {
  const [shakeCount, setShakeCount] = useState(0);
  const lastShakeTimestamp = useRef(0);
  const shakeCountRef = useRef(0);
  const onCompleteRef = useRef(onComplete);

  // Keep the callback ref fresh without re-subscribing
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const resetShakeCount = useCallback(() => {
    setShakeCount(0);
    shakeCountRef.current = 0;
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Set update interval to 100ms for responsive detection
    Accelerometer.setUpdateInterval(100);

    const subscription = Accelerometer.addListener((data) => {
      const { x, y, z } = data;
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      const now = Date.now();
      const timeSinceLastShake = now - lastShakeTimestamp.current;

      if (magnitude > sensitivity && timeSinceLastShake > debounceDuration) {
        lastShakeTimestamp.current = now;
        shakeCountRef.current += 1;
        const newCount = shakeCountRef.current;
        setShakeCount(newCount);

        if (newCount >= threshold) {
          onCompleteRef.current();
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [enabled, threshold, sensitivity, debounceDuration]);

  return { shakeCount, resetShakeCount };
}
