---
name: nyratlas
description: Read and edit a NyrAtlas outside-plant fiber project through the person's own signed-in browser tab. Use when asked to look at or change enclosures, cables, splices, splitters, trunks, planned or installed work, or history in a NyrAtlas project, or to bring a project into NyrAtlas from another tool. Needs a browser tool that can run JavaScript in the tab where the person is signed in to NyrAtlas; without one, the skill can still write a plan for the person to paste.
license: Proprietary. Free to install and use with NyrAtlas; see INSTALL.md.
metadata:
  version: 0.1.0
  homepage: https://nyratlas.com/skill/SKILL.md
  contract: https://nyratlas.com/agents.md
  scope: ospmap
---

# NyrAtlas

NyrAtlas draws outside-plant fiber as enclosures, cables, tubes, strands and splices, in a
web browser. This skill is how an agent works inside one of its projects: as the person, in
the tab where they are signed in, with the permissions they have and no others.

## When this applies

- The person has a NyrAtlas tab open and signed in, and you can run JavaScript in it.
- The project is an outside-plant map (`type: "ospmap"`). Data center projects are not
  covered by this version; leave them alone.
- Not for signing in, registering, two-factor, passwords, billing, organization members or
  roles. Those belong to the person. If a task needs one of them, say so and stop there.

## Trust model

- Same origin only. Every call is a `fetch` from the open tab with `credentials:
  'same-origin'` and the page's CSRF token. There are no tokens to copy and no API keys.
  Never read or reuse a session cookie, and never call NyrAtlas from anywhere but the tab.
- The server decides. A viewer's agent only views. A project outside its plan is read-only.
  A draft the person may not see does not exist for you. This skill grants nothing.
- The contract is the live page: **read `/agents.md` from the same site first** and prefer it
  over anything in this folder. The routes, bodies and answers there are checked against the
  running server on every deploy; this skill is the way to work them.

## Procedure

1. **Establish.** Run `scripts/session.js`. It prints who the person is and the projects
   they can reach, and leaves helpers on `window.nyr`. Never visit `/login`, `/register`,
   `/account` or anything two-factor. If the page is not signed in, tell the person and stop.
2. **Preflight.** Before planning a write, read the project's `readOnly` block
   (`references/preflight.md`). `locked: true` means stop and report the `reason`. Note
   `canEditDrafts` and `newWorkState`: they say what new work will land as.
3. **Read.** `GET /map/{map}/graph` for the whole project; `GET
   /map/{map}/enclosure/{nodeUlid}/state` for one enclosure, immediately before you write
   to it. The document you read is the document you send back, plus your change.
4. **Plan, and ask when it is destructive.** Say what will change, by project name and
   enclosure label. Get a plain yes before any of these: a `DELETE`; `POST /map/{map}/move`;
   any `restore`; `PATCH /map/{map}/enclosures/mark`; creating a project or confirming an
   import; a save that removes a cable or a splice that was there; `PATCH /map/{map}/settings`.
   Adding a cable, a splice or a trunk, and moving a node, are not destructive.
5. **Write.** One enclosure per save, through `window.nyr.save(...)` (`scripts/save-state.js`),
   which reads, applies your change, sends the whole document with the `version` it read,
   and keeps every field it did not set. New cable ids are `cable_seq + 1`; `cable_seq` never
   goes down. The document's shape and the rules the server holds it to are in
   `references/enclosure-state.md`.
6. **Conflict.** A `409` with `reason: "conflict"` means someone else saved first. The helper
   takes their contents as the new base, applies your change once more and sends again. A
   second `409` stops the work: report who saved (`by`) and what you did not do. Never resend
   the old body.
7. **Settle and verify.** A save answers `204` and settles through a queue a moment later,
   usually within a second or two. The helper reads the state back until the version moves
   (up to ten seconds) and returns the version before and after. Then check the
   screen: open or reload the enclosure, and run `scripts/verify-enclosure.js` against the
   counts you expect (`references/verify.md`). A change you cannot see on screen is not done.
8. **Report.** Say what changed and where, by enclosure label and project name, and what you
   did not do and why. The project's history shows every change under the person's name.

## Answers from the server

| Status | Meaning | Do |
|---|---|---|
| `204` | Written (a save still settles a moment later) | Read back until the version moves, verify |
| `401` / redirect to `/login` | Not signed in | Stop; the person signs in |
| `403` | Not allowed: role, plan lock, or a part of the product this account does not have | Report the message; do not retry |
| `404` | Not the person's to see | Do not retry; do not guess other ids |
| `409` on a save | Someone else saved first; body carries their contents | Rebase once, then stop |
| `409` on a page read with `X-Inertia` | The page's asset version is stale | Reload the tab, read the version again |
| `419` | The CSRF token is stale | Reload the tab and start over |
| `422` | Body out of shape; `errors` keyed by field | Fix the field named; never loosen the shape to get past it |
| `429` | More than the per-person write rate | Wait `Retry-After` seconds; you are looping |

Full list with the recoveries in `references/errors.md`.

## Leave alone

Everything `/agents.md` lists under *Leave alone*: `/account`, `/orgs/{org}/plan`,
`/orgs/{org}/transfer`, `/orgs/{org}/invites`, `/orgs/{org}/members`, `/orgs/{org}/roles`,
`/orgs/{org}/settings`, `/admin`, `/login`, `/register`, `/logout`, `/feedback`, and never
`DELETE /orgs/{org}`. Also: never delete anything to make room for something else unless the
person asks for that in so many words.

## Bringing a project in from another tool

The recipe is on `/agents.md` under *Bringing a project from another tool* and the plan
format is summarized in `references/import-plan.md`. Nothing is written until the person
confirms the preview. You read the other tool's project out of its own tab, never its API.

## Files

- `references/preflight.md`: the `readOnly` block and what each field forbids.
- `references/enclosure-state.md`: the enclosure document, field by field, with the rules.
- `references/errors.md`: every answer and the recovery.
- `references/verify.md`: settling, reading back, the on-screen check.
- `references/import-plan.md`: the plan file in brief.
- `scripts/session.js`, `scripts/read-state.js`, `scripts/save-state.js`,
  `scripts/verify-enclosure.js`: paste into the tab's console, or run through your browser
  tool's evaluate call. Each one says what it does at the top and writes nothing except
  `save-state.js`, which writes only when you call `window.nyr.save`.
- `INSTALL.md`: where to put this folder for the agent you use. `CHANGELOG.md`: what changed.
