# Macro Engine Desktop — Permanent Update Setup

## Goal
Install the updater-enabled desktop app once. After that, source-code changes can be delivered as GitHub Releases and the installed app checks for them automatically. The user does not manually download each new ZIP.

## One-time setup
1. Create a GitHub repository named `macro-engine-desktop` (public is the simplest updater setup).
2. Push this project to that repository.
3. In the app open Settings → Update Center.
4. Set **Application Update Repository** to `https://github.com/YOUR-USER/macro-engine-desktop`.
5. Save.

## Publishing a code update
After changing the source code:
```powershell
git add .
git commit -m "Describe the change"
git tag v15.0.1
git push origin main --tags
```
The included GitHub Actions workflow builds the Windows NSIS installer, runs tests, and publishes the release assets. The installed app checks at startup (after a short delay) and every 30 minutes. If a newer version is found it downloads in the background. The update is installed on restart.

## Important
- Content/data-only changes should still use the content-pack sync system and do not require an app-code release.
- Arbitrary UI, button, layout, Electron, Node, React, or security-code changes require an application release because they change executable code. The updater hides the manual download/install work from the user.
- For production security, sign the Windows installer and updater artifacts with your code-signing certificate.
- The updater should point to a repository you control. Do not put secrets in the desktop app.
