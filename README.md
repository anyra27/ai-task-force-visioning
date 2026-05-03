# AI Task Force Visioning

A 60-min affinity-group vibe-coding session for the VVUSD AI Task Force. Groups self-sort into one of four areas, vibe-code one mockup together, and submit it to the live gallery.

> Forked from [vibe-coding-standalone](../../../../Desktop/vibe-coding-standalone/) — same dark editorial design system, retargeted for this session.

## What's in here

```
AI Task Force Visioning/
├── index.html                  Landing — 4 area cards
├── teacher-support.html        Area 01 (teal) — what teachers/sites need
├── student-learning.html       Area 02 (purple) — student curriculum + AI fluency
├── family-engagement.html      Area 03 (orange) — family-facing + multilingual
├── district-systems.html       Area 04 (blue) — workflow + integrations
├── gallery.html                Live room-facing leaderboard, polls every 15s
├── Code.gs                     Apps Script: doPost / doGet / saveSubmission
├── pop.gs                      Apps Script helper: populate sheet headers
├── appsscript.json             Apps Script manifest
├── css/                        Design system (variables, base, components, animations, landing, area-page)
└── js/                         submissions-service, area-page, lazy-video, lucide
```

Each area page renders its prompts and spec hints from `js/area-page.js` — copy lives in the `AREAS` object there, not in the HTML.

---

## Activity flow (60 min)

| Phase | Time | What happens |
|------|------|------|
| 1. Frame | 5 min | "Where should AI go at VVUSD next year? Four areas. Pick the one you care about and go to that group." |
| 2. Self-sort | 2 min | People walk to one of four corners. |
| 3. Converge on one idea | 8 min | Each group lands on one thing. Quick spec card. |
| 4. Vibe-code together | 30 min | Group builds in Gemini Canvas or Google AI Studio. |
| 5. Submit to the gallery | 3 min | Each group fills the area's submission form. |
| 6. Gallery walk + share-out | 12 min | Live gallery on the room screen. Each group demos for ~2 min. Facilitator clusters themes. |

---

## Setup (one-time, before the session)

### 1. Create the Google Sheet
- Go to [sheets.new](https://sheets.new) — name it something like **VVUSD AI Task Force Visioning 2026**.
- Note the sheet ID from the URL (the long string between `/d/` and `/edit`).

### 2. Set up Apps Script
- In the sheet, **Extensions → Apps Script**.
- Paste the contents of `Code.gs` into the editor (replacing the default `Code.gs`).
- Add a second file: paste the contents of `pop.gs`.
- Save. Manifest (`appsscript.json`) should be fine as-is; if asked, paste it too.

### 3. Populate sheet headers
- In the Apps Script editor, select the function `populateHeaders` and run it.
- First run will ask for permissions — grant them.
- Switch back to the Google Sheet — you should now see three tabs: **Polls / Projects / Feedback** with bold headers. The **Projects** tab schema is what this session uses:
  ```
  Timestamp · ModuleId · UserId · UserName · UserEmail · Area · Title · Description · Link · Members
  ```

### 4. Deploy as a Web App
- In Apps Script: **Deploy → New deployment**.
- Type: **Web app**.
- Description: "VVUSD AI Task Force Visioning – session 2026".
- Execute as: **Me**.
- Who has access: **Anyone**.
- Click **Deploy**. Copy the **Web App URL** (looks like `https://script.google.com/macros/s/AKfycb.../exec`).

### 5. Wire the URL into the frontend
Open `js/submissions-service.js` and change line 19:
```js
const CONFIG = {
    SCRIPT_URL: 'PASTE_YOUR_DEPLOYED_WEB_APP_URL_HERE'
};
```
That's the only change needed in the frontend. All four area pages and the gallery share this file.

### 6. Verify the round-trip (do this the night before)
- Open `index.html` in a browser, click any area card.
- Fill the form and submit.
- Open the sheet — confirm a row landed in the **Projects** tab with `ModuleId = vvusd-ai-task-force-2026` and the right Area.
- Open `gallery.html` in another tab — confirm the submission appears within 15s.
- Open the GAS Web App URL directly in an **incognito** browser — should return JSON like `{"success":false,"error":"Missing type parameter"}` (that's expected; it confirms the endpoint is alive).

### 7. Day-of room setup
- Project `gallery.html` on the main screen from the start of the session.
- Each group has a laptop or shared device; bookmark `index.html` on each.
- Have the four areas marked with signs/tape on physical corners of the room.
- Have a backup Google Doc or Sheet ready in case GAS hiccups (groups paste their links there as a fallback).

---

## Resetting between sessions

To clear submissions and start fresh (keeps headers):
- Open the sheet, **Apps Script editor**, run `clearAllResponses` (defined in `pop.gs`).

To re-deploy after editing `Code.gs`:
- **Deploy → Manage deployments → edit the existing deployment → "New version" → Deploy**.
- The URL stays the same.

---

## Demo mode

If `SCRIPT_URL` is left as `'YOUR_APPS_SCRIPT_URL_HERE'`:
- Submissions log to the browser console instead of writing to Sheets.
- The gallery shows a banner ("Demo mode") and renders four seeded mockups so you can preview the layout.

This means you can demo the activity end-to-end without ever wiring up Apps Script, which is useful for design review or rehearsal.

---

## Risks to watch

1. **Self-sort imbalance.** If 30 people pick Teacher Support and 0 pick Family Engagement — let it happen, but call it out during framing. Don't force-balance.
2. **Group size > 8.** Split into sub-groups; each sub-group submits separately.
3. **Vibe-code tool failure.** Have a fallback — groups paste a Google Doc with a description + screenshot if Gemini Canvas / AI Studio hiccups.
4. **Gemini share URLs.** Sometimes scoped per-account. Test with at least two test submissions before the session — confirm the link opens incognito.
5. **Gallery empty during share-out.** If GAS deployment is broken, facilitator collects links manually. Activity does not depend on the gallery to function.

---

## Customization

Want to change framing copy, prompts, or spec hints for an area? Edit the `AREAS` object in `js/area-page.js` — content lives there, not in the HTML.

Want to add a new area? Add a new entry to `AREAS`, copy `teacher-support.html` to a new file, change the `AreaPage.init('newkey')` call, and add a card on `index.html` and a section on `gallery.html`.

Want to change the session label that the gallery filters by? Update `MODULE_ID` in `js/area-page.js` AND in `gallery.html` (both must match).
