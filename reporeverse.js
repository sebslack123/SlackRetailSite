#!/usr/bin/env node
// RepoReverse CLI — demo state manager for NordformSport

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const WORKING_SHA = '8810abd';  // "Initial launch" — fully working site
const BROKEN_SHA  = 'a4a96ca';  // "Break placeOrder" — shows error on checkout

// ── Tiny colour helpers (no deps) ─────────────────────────
const c = {
  reset: '\x1b[0m',
  bold:  '\x1b[1m',
  green: '\x1b[32m',
  red:   '\x1b[31m',
  yellow:'\x1b[33m',
  cyan:  '\x1b[36m',
  gray:  '\x1b[90m',
};
const bold   = s => `${c.bold}${s}${c.reset}`;
const green  = s => `${c.green}${s}${c.reset}`;
const red    = s => `${c.red}${s}${c.reset}`;
const yellow = s => `${c.yellow}${s}${c.reset}`;
const cyan   = s => `${c.cyan}${s}${c.reset}`;
const gray   = s => `${c.gray}${s}${c.reset}`;

// ── Git helpers ────────────────────────────────────────────
function git(cmd, opts = {}) {
  return execSync(`git -C "${__dir}" ${cmd}`, { encoding: 'utf8', stdio: opts.silent ? 'pipe' : ['pipe','pipe','pipe'] }).trim();
}

function currentSha() {
  return git('rev-parse HEAD').substring(0, 7);
}

function isDirty() {
  return git('status --porcelain') !== '';
}

function currentState() {
  const sha = currentSha();
  if (sha === BROKEN_SHA)  return 'broken';
  if (sha === WORKING_SHA) return 'working';
  // HEAD is neither base commit — check checkout.html content as fallback
  try {
    const src = readFileSync(join(__dir, 'checkout.html'), 'utf8');
    return src.includes("showError('Det gick inte") && !src.includes('const email = document') ? 'broken' : 'working';
  } catch { return 'unknown'; }
}

// ── Commands ───────────────────────────────────────────────

function cmdStatus() {
  const state = currentState();
  const sha   = currentSha();
  const dirty = isDirty();

  console.log('');
  console.log(bold('  RepoReverse — NordformSport Demo'));
  console.log(gray('  ─────────────────────────────────'));
  console.log(`  Commit : ${gray(sha)}`);
  console.log(`  State  : ${state === 'broken'  ? red('● broken')  :
                            state === 'working' ? green('● working') :
                                                  yellow('● unknown')}`);
  console.log(`  Dirty  : ${dirty ? yellow('yes — uncommitted changes') : green('no')}`);
  console.log('');

  if (state === 'broken') {
    console.log(`  ${yellow('!')} Checkout button shows error — ${bold('demo-ready')} for Claude Code fix`);
  } else if (state === 'working') {
    console.log(`  ${green('✓')} Checkout button works — run ${cyan('reporeverse break')} to prep a demo`);
  }
  console.log('');
}

function cmdBreak() {
  console.log('');
  if (isDirty()) {
    console.log(red('  ✗ Uncommitted changes detected. Commit or stash them first.'));
    console.log('');
    process.exit(1);
  }

  const state = currentState();
  if (state === 'broken') {
    console.log(yellow('  Already in broken state — nothing to do.'));
    console.log('');
    return;
  }

  console.log(cyan('  → Resetting to broken demo state…'));
  git(`checkout ${BROKEN_SHA} -- checkout.html`);
  // If already on a commit that has both files identical, the checkout might
  // have done nothing — do a quick content check and write if needed
  ensureBroken();
  git('add checkout.html');

  try {
    git('commit -m "chore: reset to broken demo state [reporeverse]"');
  } catch {
    // nothing to commit means it was already broken at HEAD content level
    git('reset HEAD checkout.html', { silent: true });
  }

  git('push origin HEAD');
  console.log(green('  ✓ Broken. Checkout now shows error.'));
  console.log(`  ${gray('Claude Code can fix this in a new session.')}`);
  console.log('');
}

function cmdFix() {
  console.log('');
  if (isDirty()) {
    console.log(red('  ✗ Uncommitted changes detected. Commit or stash them first.'));
    console.log('');
    process.exit(1);
  }

  const state = currentState();
  if (state === 'working') {
    console.log(yellow('  Already in working state — nothing to do.'));
    console.log('');
    return;
  }

  console.log(cyan('  → Restoring working checkout…'));
  git(`checkout ${WORKING_SHA} -- checkout.html`);
  ensureWorking();
  git('add checkout.html');

  try {
    git('commit -m "fix: restore placeOrder — checkout works again [reporeverse]"');
  } catch {
    git('reset HEAD checkout.html', { silent: true });
  }

  git('push origin HEAD');
  console.log(green('  ✓ Fixed. Checkout confirmation is working.'));
  console.log('');
}

function cmdReset() {
  // Alias for break — "reset to demo-ready broken state"
  cmdBreak();
}

function cmdHelp() {
  console.log('');
  console.log(bold('  RepoReverse') + gray(' — NordformSport demo state manager'));
  console.log('');
  console.log('  Usage: ' + cyan('node reporeverse.js <command>'));
  console.log('');
  console.log('  Commands:');
  console.log(`    ${cyan('status')}   Show current demo state`);
  console.log(`    ${cyan('break')}    Reset to broken state (error on checkout) — demo-ready`);
  console.log(`    ${cyan('fix')}      Restore working state (confirmation on checkout)`);
  console.log(`    ${cyan('reset')}    Alias for break`);
  console.log(`    ${cyan('help')}     Show this message`);
  console.log('');
  console.log('  Demo workflow:');
  console.log(gray('    1.  node reporeverse.js status   ← verify repo is ready'));
  console.log(gray('    2.  node reporeverse.js break    ← introduce the bug'));
  console.log(gray('    3.  Run your Claude Code demo    ← Claude fixes it live'));
  console.log(gray('    4.  node reporeverse.js break    ← reset for next demo'));
  console.log('');
}

// ── Content patchers (used when git checkout can't be used cleanly) ──

function ensureBroken() {
  const src = readFileSync(join(__dir, 'checkout.html'), 'utf8');
  if (!src.includes("showError('Det gick inte")) {
    // Already handled by git checkout above — this is a safety net
    const patched = src
      .replace(
        /function placeOrder\(\) \{[\s\S]*?^\s*\}/m,
        `function placeOrder() {\n      showError('Det gick inte att genomföra köpet. Försök igen senare.');\n    }\n\n    function showError(msg) {\n      const el = document.getElementById('payment-error');\n      el.textContent = msg;\n      el.style.display = 'block';\n      el.scrollIntoView({ behavior: 'smooth', block: 'center' });\n    }`
      );
    writeFileSync(join(__dir, 'checkout.html'), patched, 'utf8');
  }
}

function ensureWorking() {
  const src = readFileSync(join(__dir, 'checkout.html'), 'utf8');
  if (!src.includes("const email = document.getElementById('email')")) {
    const working = `function placeOrder() {
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
    }`;

    const patched = src.replace(
      /function placeOrder\(\) \{[\s\S]*?^\s*\}(\s*\n\s*function showError[\s\S]*?^\s*\})?/m,
      working
    );
    writeFileSync(join(__dir, 'checkout.html'), patched, 'utf8');
  }
}

// ── Entry point ────────────────────────────────────────────
const cmd = process.argv[2] || 'help';

switch (cmd) {
  case 'status':          cmdStatus(); break;
  case 'break':           cmdBreak();  break;
  case 'fix':             cmdFix();    break;
  case 'reset':           cmdReset();  break;
  case 'help': case '--help': case '-h': cmdHelp(); break;
  default:
    console.log(red(`\n  Unknown command: ${cmd}`));
    cmdHelp();
    process.exit(1);
}
