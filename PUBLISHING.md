# Publishing and updating this kit

You need GitHub Desktop and a browser. No terminal.

---

## Part 1 — one-time setup (about five minutes)

Do this once. After that, skip to Part 2.

### 1. Add the folder to GitHub Desktop

1. Open **GitHub Desktop**.
2. **File → Add Local Repository…**
3. Choose `Documents/GitHub/kai-launch-kit`.
4. **Add Repository**.

It is already a git repo with the first commit made, so it will appear with a
clean history and nothing pending.

### 2. Publish it

1. Top bar: **Publish repository**.
2. Name: `kai-launch-kit`.
3. **Uncheck "Keep this code private."** GitHub Pages will not serve a site
   from a private personal repo — this is the step the URL depends on.
4. **Publish repository**.

### 3. Turn Pages on

1. Go to `https://github.com/thomasnuth-hash/kai-launch-kit`
2. **Settings** (top right of the repo, not your account settings)
3. **Pages** in the left sidebar
4. Under **Build and deployment → Source**, choose **Deploy from a branch**
5. Branch: **main**, folder: **/ (root)**
6. **Save**

Wait one to two minutes. Reload the Pages settings screen and the URL appears
at the top:

**`https://thomasnuth-hash.github.io/kai-launch-kit/`**

That is the link you share. It opens the hub, and every cut and the tile
generator are linked from it.

---

## Part 2 — the update loop

This is the repeatable part. Three steps, about a minute.

### 1. Change something

Edit the file that owns what you want to change — see the table below.

### 2. Rebuild

Double-click **`build.command`** in the folder.

A terminal window opens, prints what it rebuilt, and waits for a keypress.
Only needed if you changed anything in `lib/`, `tiles.html` or
`tools/build_cuts.py`. If you only edited `index.html` or a markdown file,
skip it.

> First time macOS may block it: **right-click → Open**, then **Open** in the
> dialog. Only once.

### 3. Check, then push

- Double-click **`preview.command`** to see it locally first. It always serves
  at `http://localhost:4311`, and double-clicking it again just restarts it —
  you never need to hunt for an old window. Close the window when you are done.
- In **GitHub Desktop**: the changed files are listed. Write a short summary,
  **Commit to main**, then **Push origin**.

The live URL updates about a minute later. Hard-refresh if you still see the
old version — **Cmd+Shift+R**.

---

## What to edit for what

| To change | Edit | Rebuild? |
|---|---|---|
| The descriptor under the mark | **the Descriptor field on the hub or on any cut** — no file, no rebuild, no commit | no |
| Any colour | `lib/kai.js` — the `K` object at the top | yes |
| The emphasis red | same, `crimson:` | yes |
| Display or body typeface | `lib/kai.js` — `display:` / `body:` in `K`, and the font link in `lib/kai.css` | yes |
| Headline, subline or tag on a cut | `tools/build_cuts.py` — the `caption(...)` lines | yes |
| The descriptor under the mark on every cut | `tools/build_cuts.py` — `DESCRIPTOR` | yes |
| Closing line on a cut | `tools/build_cuts.py` — the `endCard(...)` line | yes |
| Tile presets | `tiles.html` — the `PRESETS` array | yes |
| Tile formats | `tiles.html` — the `FORMATS` object | yes |
| Add a launch city | `tools/build_cuts.py` `CITIES`, then `lib/tileart.js` `CITIES` | yes |
| Hub page wording or cards | `index.html` | no |
| Brand documentation | `brand/brand-notes.md` | no |

---

## If something goes wrong

**Pages URL 404s.** Give it two minutes after the first Save. If it persists,
check Settings → Pages still shows branch `main` and folder `/ (root)`, and
that the repo is public.

**A page loads but the art is missing.** Open the browser console
(**Cmd+Option+J**). A 404 on a `lib/*.js` file means a file did not get
committed — check GitHub Desktop for anything left unstaged.

**A local change is not showing up.** `preview.command` serves with caching
switched off, so a rebuild plus an ordinary refresh is enough. If you are
previewing some other way, the browser will cache `lib/*.js` hard and keep
running the old version straight through a hard reload — use
`preview.command` instead.

**`build.command` does nothing.** It needs Python 3, which ships with macOS.
Right-click → Open the first time to get past Gatekeeper.

**Underscore files vanish on the live site.** That is Jekyll. The `.nojekyll`
file in the root prevents it — do not delete it.

**You changed the descriptor but a colleague still sees the old one.** That
field is saved in *your* browser, not in the files — it is for trying wording
out. Once the line is settled it needs to become the shipped default in
`lib/copy.js` and be committed, so everyone gets it.

**You want the source PDFs published too.** They are excluded on purpose —
see `.gitignore`. Delete the last two lines of that file and commit.
