# Findings from MCP Chrome Test

1. **Profile initialization fails immediately after storage setup.** Console repeatedly logs `❌ INIT: Failed to initialize profile: JSHandle@error` following IndexedDB/storage initialization, indicating the profile bootstrap path throws before surfacing a useful message.
2. **Unused preloaded asset warning.** Browser warns that `vendor/acc_toolbar.min.js` was preloaded but not used soon after load, suggesting the preload `as` attribute or the asset usage needs adjustment.
3. **Vite dev server connection drops post-load.** `[vite] server connection lost. Polling for restart...` appears in the console, implying the dev server restarts or the HMR websocket disconnects shortly after the app renders.
