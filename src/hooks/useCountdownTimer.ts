/**
 * useCountdownTimer — a simple countdown timer hook.
 *
 * Used for the discussion phase timer.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import * as Notifications from 'expo-notifications';

interface CountdownTimerOptions {
  /** Total duration in seconds */
  durationSeconds: number;
  /** Called when the timer reaches zero */
  onComplete?: () => void;
}

interface CountdownTimerResult {
  /** Remaining time in seconds */
  timeRemaining: number;
  /** Whether the timer is currently running */
  isRunning: boolean;
  /** Start or resume the timer */
  start: () => void;
  /** Pause the timer */
  pause: () => void;
  /** Reset to the initial duration */
  reset: () => void;
  /** Formatted string "M:SS" */
  formattedTime: string;
}

export function useCountdownTimer({
  durationSeconds,
  onComplete,
}: CountdownTimerOptions): CountdownTimerResult {
  const [timeRemaining, setTimeRemaining] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notificationIdRef = useRef<string | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (notificationIdRef.current) {
        Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
        notificationIdRef.current = null;
      }
    };
  }, []);

  // Timer tick logic
  useEffect(() => {
    if (!isRunning) {
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsRunning(false);
          console.log('--- [TIMER] REACHED ZERO ---');
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const start = useCallback(async () => {
    if (timeRemaining > 0) {
      setIsRunning(true);
      try {
        notificationIdRef.current = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Time's up!",
            body: "The discussion phase is over! Find the spy!",
            sound: true,
          },
          trigger: { 
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, 
            seconds: timeRemaining 
          },
        });
      } catch (e) {
        console.warn('Failed to schedule notification', e);
      }
    }
  }, [timeRemaining]);

  const pause = useCallback(async () => {
    setIsRunning(false);
    if (notificationIdRef.current) {
      await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
      notificationIdRef.current = null;
    }
  }, []);

  const reset = useCallback(async () => {
    setIsRunning(false);
    setTimeRemaining(durationSeconds);
    if (notificationIdRef.current) {
      await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
      notificationIdRef.current = null;
    }
  }, [durationSeconds]);

  // Format as "M:SS"
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return {
    timeRemaining,
    isRunning,
    start,
    pause,
    reset,
    formattedTime,
  };
}
