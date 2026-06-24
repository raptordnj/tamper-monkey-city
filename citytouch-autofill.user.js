// ==UserScript==
// @name         CityTouch Auto Login Fill
// @namespace    https://www.citytouch.com.bd/
// @version      1.0
// @description  Auto-populate username and password on CityTouch login page
// @author       you
// @match        https://www.citytouch.com.bd/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const USERNAME = 'your_username_here';
    const PASSWORD = 'your_password_here';
    const AUTO_SUBMIT = true;        // set false to fill only
    const SUBMIT_DELAY_MS = 500;     // wait after filling so the app registers values

    // Common attribute hints used by login forms
    const USER_HINTS = ['user', 'login', 'email', 'uid', 'account', 'cif'];
    const PASS_HINTS = ['pass', 'pwd', 'pin'];
    const SUBMIT_HINTS = ['login', 'log in', 'sign in', 'signin', 'submit', 'continue'];

    function looksLike(el, hints) {
        const hay = [
            el.name,
            el.id,
            el.getAttribute('placeholder'),
            el.getAttribute('aria-label'),
            el.getAttribute('autocomplete'),
        ].filter(Boolean).join(' ').toLowerCase();
        return hints.some(h => hay.includes(h));
    }

    function findUsernameField() {
        // Exact match for CityTouch's Angular login form
        const exact = document.querySelector(
            'input[data-testid="input-username"], input[formcontrolname="username"]'
        );
        if (exact) return exact;

        // Generic fallback by hints
        const candidates = [...document.querySelectorAll(
            'input[type="text"], input[type="email"], input:not([type])'
        )].filter(el => el.offsetParent !== null); // visible only
        return candidates.find(el => looksLike(el, USER_HINTS)) || candidates[0] || null;
    }

    function findPasswordField() {
        // Exact match — note CityTouch renders the password input as type="text",
        // so we must NOT rely on input[type="password"].
        const exact = document.querySelector(
            'input[data-testid="input-password"], input[formcontrolname="password"]'
        );
        if (exact) return exact;

        // Generic fallback
        const candidates = [...document.querySelectorAll('input[type="password"]')]
            .filter(el => el.offsetParent !== null);
        return candidates.find(el => looksLike(el, PASS_HINTS)) || candidates[0] || null;
    }

    function setValue(el, value) {
        if (!el) return false;
        // Use native setter so frameworks (React/Angular/Vue) detect the change
        const proto = Object.getPrototypeOf(el);
        const setter = Object.getOwnPropertyDescriptor(proto, 'value');
        if (setter && setter.set) {
            setter.set.call(el, value);
        } else {
            el.value = value;
        }
        ['input', 'change', 'keyup', 'blur'].forEach(type => {
            el.dispatchEvent(new Event(type, { bubbles: true }));
        });
        return true;
    }

    function findSubmitButton(passEl) {
        // 0) Exact match for CityTouch's login form
        const exact = document.querySelector(
            'form.xp-login-form__form button[type="submit"], button[type="submit"][ndbutton="primary"]'
        );
        if (exact && exact.offsetParent !== null) return exact;

        // 1) A real submit control anywhere on the page
        const all = [...document.querySelectorAll(
            'button, input[type="submit"], input[type="button"], a[role="button"], [role="button"]'
        )].filter(el => el.offsetParent !== null);

        const byText = all.find(el => {
            const txt = (el.innerText || el.value || el.getAttribute('aria-label') || '').toLowerCase().trim();
            return SUBMIT_HINTS.some(h => txt.includes(h));
        });
        if (byText) return byText;

        // 2) Any submit-type control inside the password field's form
        const form = passEl && passEl.form;
        if (form) {
            const sub = form.querySelector('button[type="submit"], input[type="submit"], button:not([type])');
            if (sub) return sub;
        }
        return null;
    }

    function submit(passEl) {
        const btn = findSubmitButton(passEl);
        if (btn && !btn.disabled) {
            console.log('[CityTouch AutoFill] Clicking login button.');
            btn.click();
            return;
        }
        if (btn && btn.disabled) {
            console.warn('[CityTouch AutoFill] Login button still disabled — form may not be valid yet. Trying form submit.');
        }
        if (passEl && passEl.form) {
            console.log('[CityTouch AutoFill] Submitting form directly.');
            if (typeof passEl.form.requestSubmit === 'function') {
                passEl.form.requestSubmit();
            } else {
                passEl.form.submit();
            }
            return;
        }
        // Fallback: press Enter in the password field
        console.log('[CityTouch AutoFill] Dispatching Enter key.');
        passEl.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
    }

    function tryFill() {
        const userEl = findUsernameField();
        const passEl = findPasswordField();
        if (!userEl || !passEl) return;

        // Per-element guard: only act on a fresh form instance, not on every
        // mutation of one we've already handled. The SPA destroys & recreates
        // these nodes on re-render, so a new element means a new login attempt.
        if (passEl.dataset.ctAutofilled === '1') return;
        passEl.dataset.ctAutofilled = '1';

        setValue(userEl, USERNAME);
        setValue(passEl, PASSWORD);
        console.log('[CityTouch AutoFill] Credentials populated.');

        if (AUTO_SUBMIT) {
            setTimeout(() => submit(passEl), SUBMIT_DELAY_MS);
        }
    }

    // SPA: keep watching forever. The login form is rendered after a loader,
    // and can be re-rendered later (logout, route change, session expiry).
    // Each time the fields re-appear we populate and submit again.
    const observer = new MutationObserver(() => tryFill());
    observer.observe(document.documentElement, { childList: true, subtree: true });
    tryFill();
})();
