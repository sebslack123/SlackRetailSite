#!/usr/bin/env node
// RepoReverse CLI — interactive demo state manager for NordformSport

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dir = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

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
    // Broken = placeOrder body only shows an error, never shows the modal
    const hasFlex = src.includes("display = 'flex'") || src.includes('display="flex"') || src.includes("display: 'flex'");
    const hasError = src.includes('payment-error') && src.includes('style.display') && !hasFlex;
    if (hasError || src.includes('FIXME: placeOrder')) return 'broken';
    // Working = placeOrder shows the #order-confirmation modal
    if (hasFlex && src.includes('order-confirmation')) return 'working';
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

// ── Content patchers ───────────────────────────────────────
// Uses stable HTML markers <!-- PLACE_ORDER_START --> / <!-- PLACE_ORDER_END -->
// so patching is a simple string replace with no fragile regexes.

const PLACE_ORDER_MARKER_START = '    <!-- PLACE_ORDER_START -->';
const PLACE_ORDER_MARKER_END   = '    <!-- PLACE_ORDER_END -->';

const BROKEN_PLACE_ORDER = `    <!-- PLACE_ORDER_START -->
    <!-- FIXME: placeOrder is broken. Fix it so clicking "Genomför köp" hides
         #checkout-section and shows #order-confirmation with display='flex'.
         Use getCartTotal() for the total, formatPrice() to format it. -->
    function placeOrder() {
      const el = document.getElementById('payment-error');
      el.textContent = 'Det gick inte att genomföra köpet. Försök igen senare.';
      el.style.display = 'block';
    }
    <!-- PLACE_ORDER_END -->`;

const WORKING_PLACE_ORDER = `    <!-- PLACE_ORDER_START -->
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
    <!-- PLACE_ORDER_END -->`;

function replaceMarkerBlock(src, replacement) {
  const start = src.indexOf(PLACE_ORDER_MARKER_START);
  const end   = src.indexOf(PLACE_ORDER_MARKER_END) + PLACE_ORDER_MARKER_END.length;
  if (start === -1 || end < PLACE_ORDER_MARKER_END.length) {
    console.error('  ✗ Marker not found in checkout.html — cannot patch safely.');
    process.exit(1);
  }
  return src.slice(0, start) + replacement + src.slice(end);
}

function ensureBroken() {
  const src = readFileSync(join(__dir, 'checkout.html'), 'utf8');
  writeFileSync(join(__dir, 'checkout.html'), replaceMarkerBlock(src, BROKEN_PLACE_ORDER), 'utf8');
}

function ensureWorking() {
  const src = readFileSync(join(__dir, 'checkout.html'), 'utf8');
  writeFileSync(join(__dir, 'checkout.html'), replaceMarkerBlock(src, WORKING_PLACE_ORDER), 'utf8');
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
