# Cue Teleprompter

A standalone React Native / Expo app for rehearsing scripts and reading to a separate camera. This is the first working MVP, not a published or monetised app.

The signed Android preview APK has been built, signature-verified, installed, and launch-tested on an Android 16 emulator. [Open the install page on your Android phone](https://expo.dev/accounts/chit20/projects/cue-teleprompter/builds/1887e0a4-dffe-454f-9494-2197d8fe679f). Follow `ANDROID-TESTING.md` for physical phone checks before preparing a Play Store release.

## What works

- Create, edit, paste, search, favourite, and delete scripts.
- Save scripts and reading preferences locally, with guarded loading and serialized writes.
- Read with auto-scroll, pause/resume, restart, manual positioning, a progress indicator, adjustable text size and estimated pace (60–240 wpm).
- Optional three-second countdown and horizontal mirror mode.
- Keep the device screen awake while the reader is open; pause when the app enters the background.
- Portrait and landscape layouts; keyboard-aware editor; confirmed discard/delete actions.
- A responsive browser preview of the same React Native source.

No camera recording, floating overlay, speech recognition, accounts, cloud service, advertising, or billing is included in this version. Use a separate camera/device to film yourself. Wpm is an estimate from text layout, not voice tracking; it is most useful for whitespace-separated scripts.

## Run it

Use Node 22.13+ within the Node 22 release line, Node 24.3+, or Node 26+. Node 25 is unsupported by this Expo SDK. This project uses Expo SDK 58; the installed Expo Go app must support that SDK, otherwise use an Android development build.

```sh
npm ci
npm start
```

For a browser preview:

```sh
npm run web
```

For a local Android device/emulator build, install Android Studio, the required SDK/NDK, and a suitable JDK, then run `npx expo run:android`. The `npm run android` shortcut starts Expo and opens an already-compatible client.

## Checks

```sh
npm run check
npx expo-doctor
npm run export:android
```

`npm run check` runs lint, TypeScript, and the data tests. `expo export` validates the JavaScript/assets bundle. It does not compile or sign an APK/AAB and does not replace real Android testing. Automated tests cover corrupt storage, an intentionally empty library, Unicode round trips, invalid preferences, and reading estimates.

## Build an installable Android APK

An Expo account is required for EAS cloud builds. Log in with your account and link/create the project:

```sh
npx eas-cli@latest login
npx eas-cli@latest init
npm run build:preview
```

EAS will offer Android signing credential setup. Keep access to those credentials for future updates. The preview profile creates an APK you can install directly. Cloud builds upload project source to Expo and are subject to your account's plan/quotas.

## Prepare a Play Store release

1. Confirm the public name and choose an Android application ID you control. `com.cuestudio.teleprompter` is a draft in `app.json`, not a verified available ID. Treat it as permanent once published.
2. Link the Expo project and produce/test the preview APK on real Android phones. Test long scripts, backgrounding, orientation changes, persistence after process termination, mirror mode, and countdown cancellation.
3. Resolve dependency advisories and rerun the checks. The scaffold currently inherits high-severity npm advisories in Expo CLI's `node-forge` and Zod dependencies. These are build tooling dependencies; no forced SDK downgrade or cross-major override has been applied. Recheck upstream patches before release.
4. Test and implement the chosen monetisation model before charging anyone. This MVP has no purchases or ads; any future paid feature must have working billing, restoration, and clear purchase terms.
5. Prepare screenshots, support contact, content rating, a published privacy policy, and an accurate Data safety declaration. Review the final native manifest and every SDK before completing those forms.
6. Generate the signed Play Store Android App Bundle:

```sh
npm run build:production
```

7. Upload the AAB to Play Console's testing track, complete account-specific testing requirements, and then apply for production access/review. The production profile increments the local Android version code.

Official references: [EAS setup](https://docs.expo.dev/build/setup/), [APK versus AAB](https://docs.expo.dev/build-reference/apk/), [Play testing requirements](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en).

## Privacy and data

Scripts and preferences live in AsyncStorage on the device (browser local storage for web). They are not encrypted by this app: avoid sensitive secrets. Android app backup is disabled in the config. Clearing app/browser data or uninstalling removes the library. There is no user-facing backup/export feature yet. Production code contains no analytics or advertising SDKs; development mode connects to the development server and should not be used as a privacy reference for the production binary.

The starter scripts are examples, editable or removable like any other script. User scripts are only saved when Save script is pressed; leaving with changes prompts before discarding. Settings save immediately. A storage failure displays an error instead of silently replacing saved data.

## Source layout

- `App.tsx`: library, preferences, storage, navigation
- `src/Editor.tsx`: script authoring
- `src/Reader.tsx`: teleprompter playback
- `src/library.ts`: data model, validation, example scripts
- `src/ui.tsx`: shared components and visual styles
- `eas.json`: Android preview APK and production AAB profiles

Validation details are recorded in `VALIDATION.md`.

## Website deployment

Public website: https://hiakku-cue-teleprompter.pages.dev/

Build with Node 22.13+ and deploy the compiled website to Cloudflare Pages:

```sh
npm run build:web
npx wrangler@4.160.1 pages deploy dist --project-name hiakku-cue-teleprompter --branch main
```

The post-export script moves Expo dependency assets out of `assets/node_modules/` because Cloudflare excludes directories with that name. Only compiled website assets are uploaded. This is a direct upload deployment; GitHub pushes do not automatically redeploy it.
