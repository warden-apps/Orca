# Orca

A personal money manager that traces your take-home pay from payday to wherever
it actually lands, and tracks what you hold across bank, digital wallet and cash.

Named after the orca — the apex predator of the ocean, which hunts everything
and is hunted by nothing. Know where your money goes and you're at the top of
the chain, not the small fish getting eaten.

Everything runs in the browser. There is no account, no server and no analytics —
your figures are saved in the browser's own storage and never leave the device.

---

## Running it

**The quick way.** Double-click `index.html`. The app works and saves your data.

**The proper way** — needed for offline use and for installing it on your phone,
because browsers disable both on `file://` URLs:

Right-click `serve.ps1` → **Run with PowerShell**, or from a terminal in this folder:

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

It serves the folder at `http://localhost:8080/` and opens your browser. Ctrl+C stops it.
Nothing is installed; nothing leaves your machine.

**Putting it on your phone.** Upload this folder to any static host — GitHub Pages,
Netlify, Cloudflare Pages, or a folder on a web server. Then:

- **Android / Chrome / Edge** — an **Install** button appears in the toolbar. Tap it.
- **iPhone / Safari** — Share → **Add to Home Screen**. Safari doesn't offer the
  in-page button, so the app doesn't show one there.

Installed, it opens full-screen like an app and works with no signal.

---

## First run

The page opens on **sample figures** so you can see how it behaves. Click
**Start with my own money** (or **Set up**) and everything invented is cleared —
nothing sample-related is ever saved.

Then, in **Set up**:

1. **Accounts** — your bank, PayPay or other wallet, and cash. "Starting balance"
   is what each held the day you begin; everything after that comes from your entries.
2. **Money in** — your take-home pay, which account it lands in, and the day it arrives.
3. **Basics** — currency, the day your period starts (set this to your payday if you
   think in pay cycles rather than calendar months), and a savings goal as a % of pay.
4. **Recurring bills** — rent, electricity, gas, water, phone, subscriptions. Tick
   **"amount varies"** for anything whose figure changes monthly.

Bills listed here are counted automatically every period, so don't also log them
as expenses.

---

## How it thinks about money

**Two views of the same month, deliberately.**

- The **budget view** (the flow chart, Breakdown, "safe to spend") counts every bill
  for the period whether or not you've paid it yet. It looks forward.
- **Net worth** counts only money that has actually moved: entries you logged, bills
  you ticked as paid, pay you ticked as received. Nothing dated in the future counts,
  so a salary due on the 25th is not part of your balance on the 20th.

The Net worth panel tells you what's still outstanding between the two.

**Variable bills.** A bill marked "varies" shows up in **Due this period** on its due
day with an amount box. Until you type the real figure it uses the average of your
last three months, tagged `ESTIMATE` everywhere it appears — so your budget stays
roughly right instead of showing zero.

**Transfers are not spending.** Charging PayPay or taking cash from an ATM moves money
between your own accounts. Use **Move money** in the Net worth panel; it never counts
as an expense.

**Safe to spend per day** = pay − everything spent − bills still to go out − the gap
to your savings goal, divided by the days left in the period.

---

## Day to day

**Adding.** Tap **+ Add** (on a phone, the round **+** in the corner). Type the amount,
what it was for, and tap a category — the ones you use most sit first, and typing a
shop name like "Daiso" or "Lawson" picks its category for you. Your last account is
remembered. **Add & another** keeps the sheet open for a stack of receipts.

The same sheet does **Received** (a bonus, a refund) and **Moved** (charging PayPay,
an ATM withdrawal — moving your own money, never counted as spending).

The inline box in the ledger still works too: `480 daiso`, then **Enter**.

**Fixing a mistake — even from days ago.** Tap any row in the ledger. Change the
amount, category, account or date and save; change the date into an earlier month
and it moves there. Can't remember which month? Switch the ledger to **All time** and
search by shop, note or amount.

- **A bill for one month** — tap it (in the ledger or in *Due this period*) to fix its
  amount, mark it paid or unpaid, or **skip it this month**. It works after it's been
  marked paid, too. The bill itself stays as set up for every other month.
- **Pay for one month** — overtime, a bonus, a short month: tap your pay in the ledger
  and type what actually arrived. Your usual take-home in Set up is left alone.

**Undo.** Every change can be undone — adding, editing, deleting, ticking a bill,
changing Set up, even a Reset. Use **↶** at the top, the **Undo** on the message that
appears after each change, or **Ctrl+Z**. **Redo** is in the **⋯** menu, or
**Ctrl+Shift+Z**. The history lasts until you close the page.

**Reset** is in the **⋯** menu, in three sizes: this period only, every entry (keeping
your accounts, bills and budgets), or start over completely. Each says exactly what it
will remove before you confirm, offers a backup first, and can be undone straight after.

**Cancel means cancel.** Closing Set up or Budgets without saving puts everything
back as it was.

Also:

- **↻** on an entry logs it again today — one tap for the konbini run you make daily.
- Each day in the ledger has its own heading with that day's total.
- Click a Breakdown row to filter the ledger to that category.

**Keyboard** (on a computer): **n** add · **/** search · **Ctrl+Z** undo ·
**Ctrl+Shift+Z** redo · **Esc** closes a sheet or menu.

## Importing a statement

**Import** takes a CSV from your bank or PayPay — drop the file in or paste the rows.
It works out the delimiter, the columns, the date format and whether negative means
money out, guesses a category per row from the merchant name, and shows a preview
before anything is added. `sample-import.csv` in this folder is a working example.

## Backing up

**Export** writes every entry to CSV — transactions, transfers, settled bills and pay,
with account and category on each row. Browser storage is durable but not forever:
clearing site data wipes it. Export now and then and keep the file.

---

## The files

| File | What it is |
|---|---|
| `index.html` | the page: markup, metadata, service-worker and install wiring |
| `styles.css` | all styling. Colours live as tokens in `:root` near the top |
| `app.js` | all behaviour: model, storage, charts, sheets, import/export |
| `manifest.webmanifest` | name, icons and colours used when installed |
| `sw.js` | offline cache. Bump `CACHE` after editing `app.js` or `styles.css` |
| `serve.ps1` | small local web server for testing the installed/offline behaviour |
| `favicon.ico`, `apple-touch-icon.png`, `icon-*.png` | icons, cut from the orca artwork; `icon-192.png` is also the header mark |
| `sample-import.csv` | example of the CSV shape Import understands |

### Changing how it looks

Every colour is a CSS custom property defined in `:root` at the top of `styles.css`,
then redefined twice for dark mode — once under `@media (prefers-color-scheme: dark)`
for the OS setting, once under `:root[data-theme="dark"]`. Change a token in all three
places and the whole page follows, charts included: the SVG fills reference the same
variables, so nothing needs redrawing.

The four spending groups use `--s1` … `--s4`; account types use `--s5` … `--s8`;
`--good` / `--warn` / `--crit` are reserved for status and are never used as a
category colour.

### Changing the categories

Do it in the app — **Edit budgets** lets you rename, add and remove categories and set
each budget. Only the built-in starting list lives in `app.js` (`DEFAULT_CATS`), along
with the merchant keywords used to guess categories (`KEYWORDS`) — worth editing there
if you shop somewhere it keeps getting wrong.

---

## Where your data is

`localStorage`, under the origin you open the app from. Two consequences worth knowing:

- Data does not follow you between browsers or devices, and `http://localhost:8080`
  and a `file://` path are different origins with separate data.
- Clearing site data for that origin deletes it. That's what Export is for.
