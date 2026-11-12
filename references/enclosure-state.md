# The enclosure document

An enclosure's contents are one document, read and written whole:

```
GET /map/{map}/enclosure/{nodeUlid}/state   -> { cables, splices, cable_seq, state, version }
PUT /map/{map}/enclosure/{nodeUlid}/state   body: { cables, splices, cable_seq, version }
```

Read it immediately before the write. Send back everything you read, plus your change. Any
field you did not set, on a cable or a splice, stays exactly as it was: light levels,
drawing hints, and fields newer than this skill all ride through.

## Cables

Every component inside an enclosure is a "cable": fiber cables, splitters and OLTs alike.

| Field | Required | Values |
|---|---|---|
| `id` | yes | integer, unique within the enclosure, never reused. New ones take `cable_seq + 1`. |
| `type` | yes for new | `fiber_cable`, `splitter_sync`, `splitter_async`, `olt` |
| `side` | yes for new | `left` or `right`. The feed goes left; what it feeds goes right. |
| `sortOrder` | no | integer from 0: the order down its side |
| `label` | no | string up to 80, or `null`. Labels are optional; leave `null` rather than invent one. |
| `fiberCount` | fiber cables | 12, 24, 48, 72, 96, 144, 288 and so on |
| `standard` | fiber cables | the color standard key; copy an existing cable's or the project's (`tia598` is the usual one) |
| `state` | no | `planned` or `draft`; absent means installed. `draft` needs `canEditDrafts`. |
| `config` | by type | see below |

`config` by type:

- `splitter_sync`: `{ inputs, outputs }`. Ports are the inputs first, then the outputs: a 1x8
  has port 1 in and ports 2 to 9 out.
- `splitter_async`: `{ ratio: "95/5" }`. Always three ports: 1 in, 2 the pass leg (the large
  share), 3 the tap.
- `olt`: `{ ports, segmentIds: ["", ...] }`, one entry per port.
- `fiber_cable`: optional `segmentIds` (one per strand, index 0 is strand 1, `""` for none)
  and `light` (per-strand readings the light cards keep; never build it by hand).

Port count by type, which every splice is checked against: a fiber cable `fiberCount`; a
sync splitter `inputs + outputs`; a ratio splitter 3; an OLT `ports`.

## Splices

| Field | Required | Values |
|---|---|---|
| `id` | yes | integer, unique within the enclosure |
| `fromCableId`, `toCableId` | yes | ids of cables in this enclosure |
| `fromFiber`, `toFiber` | yes | 1-based port numbers on those cables, within their port count |
| `color` | no | a palette color name from the standard, or absent for the project's default |
| `dashed` | no | `true` to draw it dashed |
| `state` | no | `planned` or `draft`; absent means installed |
| `light` | no | the splice's own readings; never build it by hand |

A strand may not be spliced to itself. The same cable may appear on both ends (two of its
strands joined). The editor allows a strand in more than one splice and so does the server;
if the person's records say one strand to one strand, keep it that way yourself.

## `cable_seq` and `version`

- `cable_seq` is the highest cable id ever handed out here, including deleted ones. Send
  `max(cable_seq read, highest id you used)`. A new cable never takes a deleted cable's id,
  because a trunk names its end by cable id.
- `version` is the one you read. The server refuses a save whose `version` is behind a save
  someone else made (409, see errors.md) and lets your own quick second save through.

## What the server refuses (422)

`errors` is keyed by field (`cables.2.type`, `splices.0.toFiber`) with a sentence each:

- `type` or `side` not one of the values above; `standard` or `color` the project does not
  know; a non-integer where an integer goes; a cable that is not an object.
- A cable id used twice.
- A splice on a cable the enclosure does not hold.
- A splice on a port past the cable's count: strand 13 of a 12-fiber cable, port 10 of a 1x8.
- A strand spliced to itself.
- A splice without an `id`.

Nothing is stored when a save is refused. Fix the field named and send the whole document
again with the same `version`. Never remove a rule's subject (a cable, a splice) just to get
the save through; say what the person asked for cannot be drawn and why.

## Worked example

Add a 12-fiber cable on the right and splice strand 1 of the left feed (cable 1) to its
strand 1, through the helper from `scripts/save-state.js`:

```js
await window.nyr.save(mapUlid, nodeUlid, doc => {
    const id = window.nyr.nextCableId(doc);
    doc.cables.push({ id, type: 'fiber_cable', side: 'right', sortOrder: window.nyr.nextSortOrder(doc, 'right'),
                      label: null, fiberCount: 12, standard: window.nyr.standardOf(doc) ?? 'tia598' });
    doc.splices.push({ id: window.nyr.nextSpliceId(doc), fromCableId: 1, fromFiber: 1, toCableId: id, toFiber: 1 });
    return doc;
});
```
