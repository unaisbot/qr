# QR Studio

A static, browser-based QR code generator. It does not require a database, login, Firebase, or a backend.

## Features
- Website URLs and plain text
- Email links (enter `email | subject | message`)
- Phone numbers
- SMS (enter `phone number | message`)
- Wi-Fi (enter `network name | password | WPA`; use `nopass` for an open network)
- Custom foreground and background colours
- Six QR dot patterns and three corner styles
- Optional centre logo upload
- PNG and SVG downloads

## Run locally
Open `index.html` in a modern browser. An internet connection is needed to load the QR styling library from jsDelivr and the optional Google font.

## Publish on GitHub Pages
1. Create a new, separate GitHub repository for this project.
2. Upload `index.html`, `style.css`, `script.js`, and `README.md` to the repository root.
3. In **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/(root)`, then save.
4. GitHub will provide a temporary `username.github.io/repository-name` address.
5. Connect a custom domain later if desired. Do not change DNS records for any existing TBARC website.

## Notes
- All QR generation and logo reading happen in the visitor's browser.
- A QR code can contain a URL, but this website does not create or host short links or redirect links. The URL must already exist.
- Test every generated code with a phone camera before printing or distributing it.
- Use high contrast for reliable scanning. Centre logos can reduce scan reliability if they cover too much of the QR pattern.
