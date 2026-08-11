# SpyWho

An offline, pass-and-play social deduction party game for Android and iOS. One player secretly gets a different word — everyone describes theirs, and the group votes on who the odd one out is. No server, no accounts, no internet required.

## How It Works

1. **Setup** — pick the number of players, choose a word category, and set the round count
2. **Reveal** — the phone is passed around; each player shakes the device to privately reveal their word
3. **Discussion** — players take turns describing their word without saying it outright
4. **Vote** — the group picks the suspected spy, and the app reveals whether they were right

## Features

- Fully offline gameplay — no network calls at any point
- Customizable word categories and configurable round counts
- Unbiased role assignment via Fisher–Yates shuffle, so no player is statistically favoured
- Randomized word pool with fallback handling to avoid repeat words across consecutive rounds
- Shake-to-reveal using the device accelerometer (`expo-sensors`), paired with haptic feedback and audio cues

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Expo (React Native) |
| Language | TypeScript |
| Sensors | `expo-sensors` (accelerometer) |
| Feedback | `expo-haptics`, `expo-av` |
| Fonts | Fredoka |

## Project Structure

```
App.tsx              # Root component and game state machine
index.ts             # Expo entry point
src/                 # Screens, game logic, word pools, components
assets/              # Images, audio cues, icons
Fredoka/             # Bundled font family
```

## Running Locally

```bash
npm install
npm start          # Expo dev server — scan the QR code with Expo Go
npm run android    # build and run on a connected Android device or emulator
npm run ios        # build and run on an iOS simulator
```

Requires Node.js 18+ and the Expo Go app for device testing.

## Game Logic Notes

Role assignment uses a Fisher–Yates shuffle rather than repeated random index picks, which keeps the spy slot uniformly distributed across players. The word pool tracks recently used words and falls back to the wider category list when the unused pool is exhausted, so short sessions do not repeat words.
