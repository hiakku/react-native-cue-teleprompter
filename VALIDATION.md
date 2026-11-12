# Validation — 26 October 2026

## Passed

- Expo ESLint: passed without warnings. Stable hook callbacks were added for the editor back handler and reader scroll calculations.
- TypeScript: `npx tsc --noEmit`.
- Five automated data tests: `npm run check` (storage corruption, empty saved library, Unicode persistence, preference bounds, reading estimates).
- Expo Doctor: **20/20** checks passed after adding the required `expo-font` peer dependency.
- Android production JavaScript/assets export: successful, Hermes bundle about 1.7 MB, one Feather font asset. This is not an APK or AAB.
- Browser runtime loaded and rendered the React Native web preview.
- Browser interaction checks: create and save a script, reopen after reload, search, favourite and filter, open an existing script, protect unsaved edits with a dialog, keep editing, save edited script.
- Reader checks: start countdown, scroll through a script to automatic completion, restart, adjust speed and font size, toggle mirror on/off, return to library. Test preferences were restored to 130 wpm, 40 px, mirror off.
- Visual inspection of library and reader at the approximately 600 px-wide in-app browser viewport.

## Not yet verified

- Physical Android phone testing and the full interaction checklist. Native APK compilation, signing verification, emulator installation, and launch have now passed (see below). No Play Store AAB has been generated.
- Real-device screen-awake behavior, hardware back, keyboard, landscape behavior, and background pause.
- Play Console review, name/package availability, production account configuration, and store publication.
- Monetisation: no advertisements or billing are implemented.

## Dependency advisories

The Expo scaffold's npm audit reports five high-severity entries associated with the Expo CLI dependency chain (`node-forge` and Zod, including ancestor packages). The installed registry's latest `node-forge` version remains affected. A forced Expo downgrade or cross-major Zod override was not applied. Recheck upstream fixes before releasing.

## Preview

The live preview runs at `http://localhost:8081` while the development server remains running. The test script “Launch rehearsal” is stored only in this preview's local library; a fresh installation includes the three built-in examples.

## Android build handoff

The user's Expo login is verified. The project is linked to `@chit20/cue-teleprompter` (project ID `33b48fc6-5c89-4bc6-8048-9479eec7218b`). Expo generated and stores the Android signing keystore. `STORE-LISTING.md` contains draft listing copy; `ANDROID-TESTING.md` covers phone testing.

Build page: https://expo.dev/accounts/chit20/projects/cue-teleprompter/builds/365282a2-812c-48f2-968b-4d6a2f3cf51c

Initial cloud preview build completed successfully. The standalone APK (about 66.8 MB) passed `apksigner verify` with APK Signature Scheme v2, installed on an Android 16 arm64 emulator, and cold-launched successfully. `adb` reported `Status: ok`; React Native logged `Running "main"`; the app process remained alive with its MainActivity resumed and no app-specific startup errors in the collected logs. These are runtime smoke checks, not visual verification or full native interaction tests: the computer-use tool could not attach to the emulator's unbundled desktop window.

Manifest inspection found unused Expo-inherited `SYSTEM_ALERT_WINDOW` and `VIBRATE` permissions. Both were added to `android.blockedPermissions`. Replacement preview build `1887e0a4-dffe-454f-9494-2197d8fe679f` **finished successfully** on 26 October 2026 at 15:28 IST.

The final APK passed signing verification, installed successfully over the earlier preview, and cold-launched in 493 ms on the Android 16 arm64 emulator (`Status: ok`). Its process remained running and MainActivity resumed. The manifest contains `INTERNET` and the app's internal signature-protected receiver permission. Overlay, vibration, camera, microphone, and external-storage permissions are absent. Target SDK: 36. Version: 1.0.0 (1). Physical phone testing and the full interaction checklist remain pending.

Final install/build page: https://expo.dev/accounts/chit20/projects/cue-teleprompter/builds/1887e0a4-dffe-454f-9494-2197d8fe679f

The final standalone APK is saved beside the source directory as `cue-teleprompter-preview.apk` (about 66.8 MB).

SHA-256: `f778e12d29108f20b51089828998bec620e7c790d9d3123b7079b941051f77c4`.
