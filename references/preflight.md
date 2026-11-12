# Preflight: may this person change this project?

Read it before planning a write, not after a 403. The map page carries the answer in its
props. From the open tab:

```js
const version = window.nyr.version();             // from scripts/session.js
const page = await (await fetch(`/map/${mapUlid}`, { credentials: 'same-origin',
    headers: { 'X-Inertia': 'true', 'X-Inertia-Version': version, 'Accept': 'application/json' } })).json();
page.props.readOnly
```

`readOnly` holds:

| Field | Meaning | What it forbids |
|---|---|---|
| `locked` | `true` when the person may not change this project at all | Every write. Stop and report `reason`. |
| `reason` | Why: "You have view access to this project." or the plan's sentence | Say it to the person as written |
| `canRestore` | May put an enclosure or the project back to an earlier version | Any `restore` route when `false` |
| `canSeeDrafts` | Sees work an engineer has not released | When `false`, drafts are absent from everything you read; you cannot remove what you cannot see, and the server keeps them |
| `canEditDrafts` | May make work `draft` | Setting `state: "draft"` on anything when `false` (it lands as `planned`) |
| `newWorkState` | What new cables, splices and enclosures start as for this person: `installed`, `planned` or `draft` | Nothing; it tells you what to expect on the planned-work list |
| `lockedEnclosures` | ULIDs of enclosures the plan has made view-only (newest past the plan's count); usually empty | Any write to those enclosures |
| `lockedEnclosureReason` | The sentence that goes with them | Say it as written |

Two more things the person's role decides, which you learn only by the answer:

- Project settings (`PATCH /map/{map}/settings`), rename (`PATCH /map/{map}`), delete, move
  and visibility need their own permission. A `403` there is the role, not an error.
- A `dcmap` project answers `403` ("coming soon") to its routes unless the account has that
  part switched on. This skill does not work data center projects in any case.

`403` and `404` are final for this session. Do not retry them, do not try the same thing by
another route, and do not guess other ids.
