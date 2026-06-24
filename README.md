# CityTouch Auto Login (Tampermonkey)

A Tampermonkey userscript that auto-fills the username/password on
[CityTouch](https://www.citytouch.com.bd/) and submits the login form.

## Why this exists

CityTouch logs you out aggressively — after only a short spell of inactivity
your session expires and you are dropped back to the login screen. Having to
retype your credentials over and over, several times a day, quickly becomes
tedious and frustrating.

This userscript was built to put an end to that annoyance. It quietly watches
the page, and the moment the login form reappears — whether on first load or
after yet another forced logout — it fills in your credentials and signs you
back in for you. You stay where you want to be, without the constant
interruption.

## Install
1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extension.
2. Open the Tampermonkey dashboard → **Create a new script** (or **Utilities → Import**).
3. Paste the contents of [`citytouch-autofill.user.js`](./citytouch-autofill.user.js) and save.
4. **Edit the credentials** at the top of the script:
   ```js
   const USERNAME = 'your_username_here';
   const PASSWORD = 'your_password_here';
   ```
5. Visit https://www.citytouch.com.bd/ — the form fills and submits automatically.

## How it works
- The site is an Angular SPA that shows a loader before rendering the form.
- A `MutationObserver` watches permanently and fills the fields whenever they
  appear (first load or any later re-render after logout/route change).
- Values are set via the native value setter + `input` event so Angular's
  reactive form registers them.
- It submits `SUBMIT_DELAY_MS` (default 500 ms) after filling.

## Config knobs (top of the script)
| Constant | Purpose |
| --- | --- |
| `AUTO_SUBMIT` | `false` to fill only, no submit |
| `SUBMIT_DELAY_MS` | Delay between fill and submit |

> ⚠️ Your password is stored in plaintext in the script. Keep it private and
> never commit your real credentials.
