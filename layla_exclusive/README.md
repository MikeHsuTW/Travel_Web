# Layla Exclusive

Encrypted memory website: chapters 1–12 with button controls, responsive layouts and the shared 1080p v08 film. Existing credentials and wrapping records are unchanged.

HTML/CSS/JS and 116 image assets are encrypted in vault.js. The film is losslessly remuxed, independently AES-GCM encrypted in film/*.bin and loaded only in the final cinema after login. Supported browsers buffer a short playback window; others use an encrypted-download fallback. Playback is manual, with pause/resume/replay, cancellation and object URL cleanup on leaving. No plaintext photos, video, source references, private notes or backups are published. Logout reloads the gate.

Build: local LoveWebsite/private-analysis/build_publish_current.cjs. Account CLI compatibility is retained via title and imageDataUrl fields.
