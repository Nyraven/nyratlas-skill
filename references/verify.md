# Settle, read back, and look

A `204` from a save means the server took the document into a buffer. A moment later, usually
within a second or two, a queued job settles it: the enclosure's `version` goes up by one if
anything changed, history records the save under the person's name, and other open copies
are told. Verification is in three parts, and all three are the job.

## 1. Read back

`window.nyr.save` does this for you: it reads
`GET /map/{map}/enclosure/{nodeUlid}/state` back every half second until the version moves,
for up to ten seconds, and returns `{ before, after, settled, state }`. Check:

- `settled: true` and `after > before` when the save changed something. `settled: false`
  means either the save was a no-op (the document you sent matched what was there) or the
  worker is behind; read the state once more before deciding which.
- The cables and splices you added are in `state.cables` and `state.splices` with the ids
  you gave them.
- Nothing you did not mean to remove is missing.

For map-level changes (a node moved, a trunk added or removed), read `GET /map/{map}/graph`
and find the node or edge by ulid.

## 2. Look at the screen

Open the enclosure in the tab: navigate to `/map/{map}/enclosure/{nodeUlid}`, or reload it
if it is already open, so the canvas is drawn from what the server now holds. Then run
`scripts/verify-enclosure.js`:

```js
window.nyr.verifyEnclosure({ splices: 6 })   // what you expect to see drawn
```

It counts the splice lines on the enclosure canvas and compares. A mismatch means the drawing
does not show what you think you saved; stop and look before doing anything else. Take a
screenshot for the person if your tool can.

Also check the browser console for errors after the reload. A red line that names the
enclosure page is a sign the document is drawable to the server but not to the canvas; report
it with the exact text.

## 3. Say what you saw

Report in the person's terms: project name, enclosure label, what was added or changed, the
version it is at now, and anything you expected to see and did not. "Saved" alone is not a
report.

## When it is not there

- Version did not move and you expected a change: compare what you sent with what you read;
  the usual cause is a change applied to a copy, not to the document you sent.
- The splice count is short by exactly your additions: the page was not reloaded after the
  save, or you are looking at a different enclosure's canvas (the project map and the
  enclosure both have a canvas; the helper uses the last one opened).
- A `404` on the enclosure page after a successful save: the enclosure became a draft and the
  person may not see drafts. Report it; do not try to undo.
