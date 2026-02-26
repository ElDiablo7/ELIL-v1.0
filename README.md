## GRACE-X TITAN™ + SENTINEL™

Offline-first security overlay with Sentinel (governor) and TITAN (threat assessment nucleus). 

**Run:** Open `index.html` in a browser.

### 🔑 Authentication Access
The following credentials grant **OPERATOR** level access to the security console:

- **Default PIN:** `0000`
- **Override Key:** `SENTINEL_OVERRIDE`

> [!NOTE]
> **Resilience Mode (v1.1 Patch)**: The system now includes embedded fallback data to support direct opening via the `file://` protocol. If the browser blocks network requests for JSON data, the system will automatically switch to internal defaults.

### Deploy on Render (Web Service)

- **Build Command:** `npm install` (or `npm run build`)
- **Start Command:** `npm start`

The app is served via `serve` on Render's `PORT`. For a static-only deploy, you can instead create a **Static Site** on Render with Publish Directory `.` and no build command.

See [README_TITAN_SENTINEL.md](README_TITAN_SENTINEL.md) for full documentation, UI guide, and test checklist.
