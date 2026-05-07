#!/usr/bin/env node
// RepoReverse CLI — interactive demo state manager for NordformSport

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dir = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// SHA refs kept for reference only — no longer used for checkout patching
const WORKING_SHA = '8810abd';
const BROKEN_SHA  = 'a4a96ca';

// ── Colours (no extra dep) ─────────────────────────────────
const ESC = '\x1b[';
const r   = s => `${ESC}0m${s}${ESC}0m`;
const bold = s => `${ESC}1m${s}${ESC}0m`;

// gradients: pink → yellow → green (like the screenshot)
const LOGO_COLORS = [
  '\x1b[38;2;255;100;200m',  // pink
  '\x1b[38;2;255;150;100m',  // salmon
  '\x1b[38;2;255;210;80m',   // yellow
  '\x1b[38;2;160;230;80m',   // lime
  '\x1b[38;2;80;220;180m',   // teal
  '\x1b[38;2;100;180;255m',  // blue
];

const col = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  green:  '\x1b[32m',
  bgreen: '\x1b[92m',
  red:    '\x1b[31m',
  bred:   '\x1b[91m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  bcyan:  '\x1b[96m',
  mag:    '\x1b[35m',
  bmag:   '\x1b[95m',
  gray:   '\x1b[90m',
  white:  '\x1b[97m',
  bgBlue: '\x1b[44m',
  bgMag:  '\x1b[45m',
  bgDark: '\x1b[48;2;20;20;40m',
};
const clr = (c, s) => `${c}${s}${col.reset}`;

// ── ASCII banner via figlet ───────────────────────────────
function printBanner() {
  let figlet;
  try { figlet = require('figlet'); } catch { figlet = null; }

  console.clear();

  if (figlet) {
    const text = figlet.textSync('RepoReverse', { font: 'Big', horizontalLayout: 'default' });
    const lines = text.split('\n');
    const totalColors = LOGO_COLORS.length;
    lines.forEach((line, i) => {
      const color = LOGO_COLORS[i % totalColors];
      console.log(`  ${color}${line}${col.reset}`);
    });
  } else {
    // Fallback block letters
    const pink = '\x1b[38;2;255;100;200m';
    const lime = '\x1b[38;2;160;230;80m';
    console.log(`\n  ${pink}██████╗ ███████╗██████╗  ██████╗ ${lime}██████╗ ███████╗██╗   ██╗███████╗██████╗ ███████╗███████╗${col.reset}`);
    console.log(`  ${pink}██╔══██╗██╔════╝██╔══██╗██╔═══██╗${lime}██╔══██╗██╔════╝██║   ██║██╔════╝██╔══██╗██╔════╝██╔════╝${col.reset}`);
    console.log(`  ${pink}██████╔╝█████╗  ██████╔╝██║   ██║${lime}██████╔╝█████╗  ██║   ██║█████╗  ██████╔╝███████╗█████╗  ${col.reset}`);
    console.log(`  ${pink}██╔══██╗██╔══╝  ██╔═══╝ ██║   ██║${lime}██╔══██╗██╔══╝  ╚██╗ ██╔╝██╔══╝  ██╔══██╗╚════██║██╔══╝  ${col.reset}`);
    console.log(`  ${pink}██║  ██║███████╗██║     ╚██████╔╝${lime}██║  ██║███████╗ ╚████╔╝ ███████╗██║  ██║███████║███████╗${col.reset}`);
    console.log(`  ${pink}╚═╝  ╚═╝╚══════╝╚═╝      ╚═════╝ ${lime}╚═╝  ╚═╝╚══════╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝${col.reset}`);
  }

  console.log('');
  console.log(
    `  ${col.bgMag}${col.white}${col.bold} CONTROL CENTER ${col.reset}  ` +
    clr(col.bold + col.white, 'AI Demo Repo Control Center')
  );
  console.log(`  ${clr(col.dim + col.white, 'Reset, fix, and manage your NordformSport demo — effortlessly.')}`);
  console.log('');
  console.log(clr(col.gray, '  Use ↑/↓ arrows to move, Enter to choose, Ctrl+C to exit.'));
  console.log('');
}

// ── Git helpers ────────────────────────────────────────────
function git(cmd, opts = {}) {
  return execSync(`git -C "${__dir}" ${cmd}`, {
    encoding: 'utf8',
    stdio: 'pipe',
  }).trim();
}

function currentSha()  { return git('rev-parse HEAD').substring(0, 7); }
function isDirty()     { return git('status --porcelain') !== ''; }

function currentState() {
  try {
    const src = readFileSync(join(__dir, 'checkout.html'), 'utf8');
    if (src.includes('Det gick inte att genomföra köpet')) return 'broken';
    if (src.includes("display = 'flex'") && src.includes('order-confirmation')) return 'working';
    return 'unknown';
  } catch { return 'unknown'; }
}

// ── State display ──────────────────────────────────────────
function getStatusLine() {
  const state = currentState();
  const sha   = currentSha();
  const dirty = isDirty();

  const stateStr = state === 'broken'
    ? clr(col.bgreen + col.bold, '● DEMO READY')
    : state === 'working'
    ? clr(col.bcyan + col.bold,  '● FIXED')
    : clr(col.yellow, '● UNKNOWN');

  const dirtyStr = dirty
    ? clr(col.yellow, 'yes — uncommitted changes')
    : clr(col.gray, 'clean');

  return { state, sha, dirty, stateStr, dirtyStr };
}

function printStatus() {
  const { state, sha, stateStr, dirtyStr } = getStatusLine();

  console.log('');
  console.log(clr(col.bold + col.white, '  ┌─ Current Demo State ───────────────────────┐'));
  console.log(`  │  State  :  ${stateStr.padEnd(28)}       │`);
  console.log(`  │  Commit :  ${clr(col.gray, sha).padEnd(28)}       │`);
  console.log(`  │  Dirty  :  ${dirtyStr.padEnd(28)}       │`);
  console.log(clr(col.bold + col.white, '  └─────────────────────────────────────────────┘'));
  console.log('');

  if (state === 'broken') {
    console.log(`  ${clr(col.bgreen, '✓')} Checkout is demo-ready — Claude Code will fix this live`);
  } else if (state === 'working') {
    console.log(`  ${clr(col.bgreen, '✓')} Checkout confirmation works — break it to start a demo`);
  }
  console.log('');
}

// ── Core operations ────────────────────────────────────────
function doBreak() {
  process.stdout.write(clr(col.bcyan, '\n  → Syncing with remote'));
  try { git('pull --rebase origin main'); } catch { /* already up to date or no remote */ }
  process.stdout.write(clr(col.bcyan, ' ✓\n'));

  if (isDirty()) {
    console.log(clr(col.bred, '\n  ✗ Uncommitted changes detected. Commit or stash first.\n'));
    return false;
  }
  if (currentState() === 'broken') {
    console.log(clr(col.yellow, '\n  Already broken — nothing to do.\n'));
    return true;
  }

  process.stdout.write(clr(col.bcyan, '\n  → Resetting to broken demo state'));
  ensureBroken();
  git('add checkout.html');
  try { git('commit -m "chore: reset to broken demo state [reporeverse]"'); }
  catch { git('restore --staged checkout.html'); }

  animateDots();
  git('push origin HEAD');
  console.log(clr(col.bgreen, '\n  ✓ Done! Checkout now shows error message.'));
  console.log(clr(col.gray,   '  Claude Code can fix this in a new session.\n'));
  return true;
}

function doFix() {
  process.stdout.write(clr(col.bcyan, '\n  → Syncing with remote'));
  try { git('pull --rebase origin main'); } catch { /* already up to date or no remote */ }
  process.stdout.write(clr(col.bcyan, ' ✓\n'));

  if (isDirty()) {
    console.log(clr(col.bred, '\n  ✗ Uncommitted changes detected. Commit or stash first.\n'));
    return false;
  }
  if (currentState() === 'working') {
    console.log(clr(col.yellow, '\n  Already working — nothing to do.\n'));
    return true;
  }

  process.stdout.write(clr(col.bcyan, '\n  → Restoring working checkout'));
  ensureWorking();
  git('add checkout.html');
  try { git('commit -m "fix: restore placeOrder — checkout works again [reporeverse]"'); }
  catch { git('restore --staged checkout.html'); }

  animateDots();
  git('push origin HEAD');
  console.log(clr(col.bgreen, '\n  ✓ Done! Checkout confirmation is fully working.\n'));
  return true;
}

function animateDots(n = 3) {
  for (let i = 0; i < n; i++) {
    process.stdout.write(clr(col.bcyan, '.'));
    execSync('sleep 0.3');
  }
}

// ── Full-file checkout snapshots ──────────────────────────
// reporeverse owns these completely. Claude Code can do whatever it wants
// to checkout.html — break/fix always writes the exact known-good bytes.

const CHECKOUT_WORKING = `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kassa – NordformSport</title>
  <link rel="stylesheet" href="css/style.css" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
</head>
<body>
  <header class="navbar">
    <div class="nav-inner">
      <a href="index.html" class="logo">Nordform<span>Sport</span></a>
      <nav class="nav-links">
        <a href="running.html">Löpning</a>
        <a href="squash.html">Squash</a>
        <a href="golf.html">Golf</a>
        <a href="about.html">Om oss</a>
      </nav>
      <div class="nav-actions">
        <a href="cart.html" class="cart-icon" id="cart-link">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <span class="cart-count" id="cart-count">0</span>
        </a>
      </div>
    </div>
  </header>

  <!-- CONFIRMATION OVERLAY -->
  <div class="order-confirmation" id="order-confirmation" style="display:none;">
    <div class="confirmation-card">
      <div class="confirmation-icon">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>
      <h2>Beställning bekräftad!</h2>
      <p class="conf-sub">Betalning mottagen. Tack för ditt köp hos NordformSport.</p>
      <div class="conf-detail">
        <div><span>Ordernummer</span><strong id="order-number">#NF-000000</strong></div>
        <div><span>Beräknad leverans</span><strong id="delivery-date">–</strong></div>
        <div><span>Betalningsmetod</span><strong id="payment-method-display">–</strong></div>
        <div><span>Totalt betalt</span><strong id="conf-total">–</strong></div>
      </div>
      <p class="conf-email">En orderbekräftelse har skickats till <strong id="conf-email-addr">din e-post</strong>.</p>
      <a href="index.html" class="btn btn-primary" onclick="clearCartAndGo(event)">Fortsätt handla</a>
    </div>
  </div>

  <!-- CHECKOUT FORM -->
  <section class="section" id="checkout-section">
    <div class="container">
      <h1 class="page-title">Kassa</h1>

      <div class="checkout-layout">

        <!-- LEFT: Form -->
        <div class="checkout-form-col">

          <div class="checkout-block">
            <h3>Kontaktuppgifter</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Förnamn</label>
                <input type="text" id="fname" placeholder="Erik" />
              </div>
              <div class="form-group">
                <label>Efternamn</label>
                <input type="text" id="lname" placeholder="Svensson" />
              </div>
            </div>
            <div class="form-group">
              <label>E-postadress</label>
              <input type="email" id="email" placeholder="erik@exempel.se" />
            </div>
            <div class="form-group">
              <label>Telefon</label>
              <input type="tel" id="phone" placeholder="070-123 45 67" />
            </div>
          </div>

          <div class="checkout-block">
            <h3>Leveransadress</h3>
            <div class="form-group">
              <label>Gatuadress</label>
              <input type="text" id="address" placeholder="Storgatan 12" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Postnummer</label>
                <input type="text" id="zip" placeholder="114 36" />
              </div>
              <div class="form-group">
                <label>Stad</label>
                <input type="text" id="city" placeholder="Stockholm" />
              </div>
            </div>
            <div class="form-group">
              <label>Land</label>
              <select id="country">
                <option value="SE">Sverige</option>
                <option value="NO">Norge</option>
                <option value="DK">Danmark</option>
                <option value="FI">Finland</option>
              </select>
            </div>
          </div>

          <div class="checkout-block">
            <h3>Betalningsmetod</h3>
            <div class="payment-options">
              <label class="payment-option">
                <input type="radio" name="payment" value="card" checked />
                <div class="payment-label">
                  <span>Betalkort</span>
                  <div class="card-icons">
                    <span class="card-badge">VISA</span>
                    <span class="card-badge">MC</span>
                  </div>
                </div>
              </label>
              <label class="payment-option">
                <input type="radio" name="payment" value="swish" />
                <div class="payment-label">
                  <span>Swish</span>
                  <span class="swish-badge">Swish</span>
                </div>
              </label>
              <label class="payment-option">
                <input type="radio" name="payment" value="klarna" />
                <div class="payment-label">
                  <span>Faktura – Klarna</span>
                  <span class="klarna-badge">K</span>
                </div>
              </label>
            </div>

            <div class="card-fields" id="card-fields">
              <div class="form-group">
                <label>Kortnummer</label>
                <input type="text" placeholder="1234 5678 9012 3456" maxlength="19" id="card-number" oninput="formatCard(this)" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Giltig till</label>
                  <input type="text" placeholder="MM/ÅÅ" maxlength="5" id="card-expiry" oninput="formatExpiry(this)" />
                </div>
                <div class="form-group">
                  <label>CVC</label>
                  <input type="text" placeholder="123" maxlength="3" id="card-cvc" />
                </div>
              </div>
            </div>

            <div class="swish-fields" id="swish-fields" style="display:none;">
              <div class="form-group">
                <label>Mobilnummer för Swish</label>
                <input type="tel" placeholder="070-123 45 67" />
              </div>
            </div>
          </div>

        </div>

        <!-- RIGHT: Order summary -->
        <div class="checkout-summary-col">
          <div class="checkout-block summary-block">
            <h3>Din beställning</h3>
            <div id="checkout-items"></div>
            <div class="summary-totals" id="summary-totals"></div>
            <button class="btn btn-primary btn-full" onclick="placeOrder()">Genomför köp</button>
            <p class="secure-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Säker betalning med 256-bit SSL-kryptering
            </p>
          </div>
        </div>

      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <span class="logo">Nordform<span>Sport</span></span>
        <p>Vi levererar kvalitetsutrustning för svenska sportentusiaster sedan 2010.</p>
      </div>
      <div class="footer-links">
        <h4>Sport</h4>
        <a href="running.html">Löpning</a>
        <a href="squash.html">Squash</a>
        <a href="golf.html">Golf</a>
      </div>
      <div class="footer-links">
        <h4>Kundservice</h4>
        <a href="#">Frakt &amp; retur</a>
        <a href="#">Kontakta oss</a>
        <a href="#">Vanliga frågor</a>
      </div>
      <div class="footer-links">
        <h4>Företag</h4>
        <a href="about.html">Om oss</a>
        <a href="#">Press</a>
        <a href="#">Karriär</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 NordformSport AB. Org.nr 556789-1234. Alla rättigheter förbehållna.</p>
    </div>
  </footer>

  <script src="js/products.js"></script>
  <script src="js/cart.js"></script>
  <script>
    // __REPOREVERSE_WORKING__
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
      radio.addEventListener('change', () => {
        document.getElementById('card-fields').style.display = radio.value === 'card' ? 'block' : 'none';
        document.getElementById('swish-fields').style.display = radio.value === 'swish' ? 'block' : 'none';
      });
    });

    function formatCard(el) {
      el.value = el.value.replace(/\\D/g, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19);
    }
    function formatExpiry(el) {
      let v = el.value.replace(/\\D/g, '');
      if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
      el.value = v;
    }

    function placeOrder() {
      const email = document.getElementById('email').value || 'din@email.se';
      const payment = document.querySelector('input[name="payment"]:checked').value;
      const paymentLabels = { card: 'Betalkort', swish: 'Swish', klarna: 'Klarna faktura' };
      const orderNum = '#NF-' + Math.floor(100000 + Math.random() * 900000);
      const deliveryDate = new Date(Date.now() + 3 * 86400000).toLocaleDateString('sv-SE', { weekday: 'long', month: 'long', day: 'numeric' });
      const total = getCartTotal();

      document.getElementById('order-number').textContent = orderNum;
      document.getElementById('delivery-date').textContent = deliveryDate;
      document.getElementById('payment-method-display').textContent = paymentLabels[payment];
      document.getElementById('conf-total').textContent = formatPrice(total);
      document.getElementById('conf-email-addr').textContent = email;

      document.getElementById('checkout-section').style.display = 'none';
      const conf = document.getElementById('order-confirmation');
      conf.style.display = 'flex';
      conf.scrollIntoView({ behavior: 'smooth' });
    }

    function clearCartAndGo(e) {
      localStorage.removeItem('nordform_cart');
    }

    renderCheckoutSummary();
  </script>
</body>
</html>`;

const CHECKOUT_BROKEN = `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kassa – NordformSport</title>
  <link rel="stylesheet" href="css/style.css" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
</head>
<body>
  <header class="navbar">
    <div class="nav-inner">
      <a href="index.html" class="logo">Nordform<span>Sport</span></a>
      <nav class="nav-links">
        <a href="running.html">Löpning</a>
        <a href="squash.html">Squash</a>
        <a href="golf.html">Golf</a>
        <a href="about.html">Om oss</a>
      </nav>
      <div class="nav-actions">
        <a href="cart.html" class="cart-icon" id="cart-link">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <span class="cart-count" id="cart-count">0</span>
        </a>
      </div>
    </div>
  </header>

  <!-- CONFIRMATION OVERLAY -->
  <div class="order-confirmation" id="order-confirmation" style="display:none;">
    <div class="confirmation-card">
      <div class="confirmation-icon">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      </div>
      <h2>Beställning bekräftad!</h2>
      <p class="conf-sub">Betalning mottagen. Tack för ditt köp hos NordformSport.</p>
      <div class="conf-detail">
        <div><span>Ordernummer</span><strong id="order-number">#NF-000000</strong></div>
        <div><span>Beräknad leverans</span><strong id="delivery-date">–</strong></div>
        <div><span>Betalningsmetod</span><strong id="payment-method-display">–</strong></div>
        <div><span>Totalt betalt</span><strong id="conf-total">–</strong></div>
      </div>
      <p class="conf-email">En orderbekräftelse har skickats till <strong id="conf-email-addr">din e-post</strong>.</p>
      <a href="index.html" class="btn btn-primary" onclick="clearCartAndGo(event)">Fortsätt handla</a>
    </div>
  </div>

  <!-- CHECKOUT FORM -->
  <section class="section" id="checkout-section">
    <div class="container">
      <h1 class="page-title">Kassa</h1>

      <div class="checkout-layout">

        <!-- LEFT: Form -->
        <div class="checkout-form-col">

          <div class="checkout-block">
            <h3>Kontaktuppgifter</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Förnamn</label>
                <input type="text" id="fname" placeholder="Erik" />
              </div>
              <div class="form-group">
                <label>Efternamn</label>
                <input type="text" id="lname" placeholder="Svensson" />
              </div>
            </div>
            <div class="form-group">
              <label>E-postadress</label>
              <input type="email" id="email" placeholder="erik@exempel.se" />
            </div>
            <div class="form-group">
              <label>Telefon</label>
              <input type="tel" id="phone" placeholder="070-123 45 67" />
            </div>
          </div>

          <div class="checkout-block">
            <h3>Leveransadress</h3>
            <div class="form-group">
              <label>Gatuadress</label>
              <input type="text" id="address" placeholder="Storgatan 12" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Postnummer</label>
                <input type="text" id="zip" placeholder="114 36" />
              </div>
              <div class="form-group">
                <label>Stad</label>
                <input type="text" id="city" placeholder="Stockholm" />
              </div>
            </div>
            <div class="form-group">
              <label>Land</label>
              <select id="country">
                <option value="SE">Sverige</option>
                <option value="NO">Norge</option>
                <option value="DK">Danmark</option>
                <option value="FI">Finland</option>
              </select>
            </div>
          </div>

          <div class="checkout-block">
            <h3>Betalningsmetod</h3>
            <div class="payment-options">
              <label class="payment-option">
                <input type="radio" name="payment" value="card" checked />
                <div class="payment-label">
                  <span>Betalkort</span>
                  <div class="card-icons">
                    <span class="card-badge">VISA</span>
                    <span class="card-badge">MC</span>
                  </div>
                </div>
              </label>
              <label class="payment-option">
                <input type="radio" name="payment" value="swish" />
                <div class="payment-label">
                  <span>Swish</span>
                  <span class="swish-badge">Swish</span>
                </div>
              </label>
              <label class="payment-option">
                <input type="radio" name="payment" value="klarna" />
                <div class="payment-label">
                  <span>Faktura – Klarna</span>
                  <span class="klarna-badge">K</span>
                </div>
              </label>
            </div>

            <div class="card-fields" id="card-fields">
              <div class="form-group">
                <label>Kortnummer</label>
                <input type="text" placeholder="1234 5678 9012 3456" maxlength="19" id="card-number" oninput="formatCard(this)" />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Giltig till</label>
                  <input type="text" placeholder="MM/ÅÅ" maxlength="5" id="card-expiry" oninput="formatExpiry(this)" />
                </div>
                <div class="form-group">
                  <label>CVC</label>
                  <input type="text" placeholder="123" maxlength="3" id="card-cvc" />
                </div>
              </div>
            </div>

            <div class="swish-fields" id="swish-fields" style="display:none;">
              <div class="form-group">
                <label>Mobilnummer för Swish</label>
                <input type="tel" placeholder="070-123 45 67" />
              </div>
            </div>
          </div>

        </div>

        <!-- RIGHT: Order summary -->
        <div class="checkout-summary-col">
          <div class="checkout-block summary-block">
            <h3>Din beställning</h3>
            <div id="checkout-items"></div>
            <div class="summary-totals" id="summary-totals"></div>
            <div id="payment-error" style="display:none; background:#fef2f2; border:1px solid #fca5a5; color:#b91c1c; border-radius:8px; padding:12px 16px; margin-bottom:14px; font-size:.875rem; font-weight:500;"></div>
            <button class="btn btn-primary btn-full" onclick="placeOrder()">Genomför köp</button>
            <p class="secure-note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Säker betalning med 256-bit SSL-kryptering
            </p>
          </div>
        </div>

      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <span class="logo">Nordform<span>Sport</span></span>
        <p>Vi levererar kvalitetsutrustning för svenska sportentusiaster sedan 2010.</p>
      </div>
      <div class="footer-links">
        <h4>Sport</h4>
        <a href="running.html">Löpning</a>
        <a href="squash.html">Squash</a>
        <a href="golf.html">Golf</a>
      </div>
      <div class="footer-links">
        <h4>Kundservice</h4>
        <a href="#">Frakt &amp; retur</a>
        <a href="#">Kontakta oss</a>
        <a href="#">Vanliga frågor</a>
      </div>
      <div class="footer-links">
        <h4>Företag</h4>
        <a href="about.html">Om oss</a>
        <a href="#">Press</a>
        <a href="#">Karriär</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 NordformSport AB. Org.nr 556789-1234. Alla rättigheter förbehållna.</p>
    </div>
  </footer>

  <script src="js/products.js"></script>
  <script src="js/cart.js"></script>
  <script>
    // __REPOREVERSE_BROKEN__
    document.querySelectorAll('input[name="payment"]').forEach(radio => {
      radio.addEventListener('change', () => {
        document.getElementById('card-fields').style.display = radio.value === 'card' ? 'block' : 'none';
        document.getElementById('swish-fields').style.display = radio.value === 'swish' ? 'block' : 'none';
      });
    });

    function formatCard(el) {
      el.value = el.value.replace(/\\D/g, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19);
    }
    function formatExpiry(el) {
      let v = el.value.replace(/\\D/g, '');
      if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2, 4);
      el.value = v;
    }

    function placeOrder() {
      const el = document.getElementById('payment-error');
      el.textContent = 'Det gick inte att genomföra köpet. Försök igen senare.';
      el.style.display = 'block';
    }

    function clearCartAndGo(e) {
      localStorage.removeItem('nordform_cart');
    }

    renderCheckoutSummary();
  </script>
</body>
</html>`;

function ensureBroken() {
  writeFileSync(join(__dir, 'checkout.html'), CHECKOUT_BROKEN, 'utf8');
}

function ensureWorking() {
  writeFileSync(join(__dir, 'checkout.html'), CHECKOUT_WORKING, 'utf8');
}

// ── Interactive menu ───────────────────────────────────────
async function interactiveMenu() {
  let select, Separator;
  try {
    const mod = await import('@inquirer/prompts');
    select    = mod.select;
    Separator = mod.Separator;
  } catch {
    console.log(clr(col.bred, '\n  @inquirer/prompts not found — run: npm install\n'));
    process.exit(1);
  }

  while (true) {
    printBanner();
    const { state, stateStr } = getStatusLine();

    console.log(`  Current state: ${stateStr}\n`);

    const action = await select({
      message: 'Main menu: pick what you want to do',
      choices: [
        { name: '  1  Reset to DEMO READY  — breaks checkout for demo', value: 'break' },
        { name: '  2  Fix checkout          — restores working confirmation', value: 'fix' },
        { name: '  3  Check status          — see current repo state', value: 'status' },
        new Separator(),
        { name: '  0  Exit', value: 'quit' },
      ],
      loop: false,
      pageSize: 8,
    });

    if (action === 'quit') {
      console.log(clr(col.gray, '\n  Bye.\n'));
      process.exit(0);
    }

    if (action === 'status') {
      printBanner();
      printStatus();
    } else if (action === 'break') {
      doBreak();
    } else if (action === 'fix') {
      doFix();
    }

    // Pause so user can read output before redrawing menu
    const { input } = await import('@inquirer/prompts');
    await input({ message: clr(col.gray, 'Press Enter to return to menu…') });
  }
}

// ── Entry point: CLI flags or interactive ─────────────────
const cmd = process.argv[2];

if (!cmd) {
  interactiveMenu();
} else {
  switch (cmd) {
    case 'break':  case 'reset': doBreak();   break;
    case 'fix':                  doFix();     break;
    case 'status':               printBanner(); printStatus(); break;
    case '--help': case '-h':
      printBanner();
      console.log('  Direct commands (skip the menu):');
      console.log(`    ${clr(col.cyan, 'node reporeverse.js break')}   Reset to broken / demo-ready`);
      console.log(`    ${clr(col.cyan, 'node reporeverse.js fix')}     Restore working checkout`);
      console.log(`    ${clr(col.cyan, 'node reporeverse.js status')}  Show current state`);
      console.log(`    ${clr(col.cyan, 'node reporeverse.js')}         Open interactive menu`);
      console.log('');
      break;
    default:
      console.log(clr(col.bred, `\n  Unknown command: ${cmd}`));
      process.exit(1);
  }
}
