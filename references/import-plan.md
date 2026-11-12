# The plan file, in brief

A plan is a whole project written in NyrAtlas terms, as JSON. It goes in through the Import
Project dialog on the Dashboard (*Or paste a plan*, then *Read plan*), or by the same two
calls from the tab's console:

```
POST /orgs/{org}/projects/import            { plan: "<the JSON as a string>" }
   -> { token, name, summary, outline, warnings }    nothing created yet
POST /orgs/{org}/projects/import/confirm    { token, name }
   -> redirects to the new project                   only after the person says yes
```

The full recipe, including how to read another tool's project out of its own tab and carry it
over on the clipboard, is on `/agents.md` under *Bringing a project from another tool*. Read
that; this page is only the shape.

```json
{
  "name": "KRP Fiber",
  "enclosures": [
    { "label": "KRP-09-004", "sublabel": null, "info_line_2": null, "x": 0, "y": 0,
      "properties": {
        "cables": [
          { "id": 1, "type": "fiber_cable", "label": null, "side": "left",  "sortOrder": 0, "fiberCount": 12, "standard": "tia598" },
          { "id": 2, "type": "fiber_cable", "label": null, "side": "right", "sortOrder": 0, "fiberCount": 12 },
          { "id": 3, "type": "splitter_sync", "label": null, "side": "left", "sortOrder": 1, "config": { "inputs": 1, "outputs": 8 } }
        ],
        "splices": [
          { "fromCableId": 1, "fromFiber": 1, "toCableId": 3, "toFiber": 1 },
          { "fromCableId": 3, "fromFiber": 2, "toCableId": 2, "toFiber": 1 }
        ]
      } }
  ],
  "links": [ { "from": 0, "to": 1, "from_cable_id": 2, "to_cable_id": 1 } ],
  "warnings": ["Anything the person should know before confirming."]
}
```

Rules that differ from a save:

- `type` and `side` are required on every cable; a plan says what it means.
- Splices carry no `id`; the importer numbers them.
- `links` name enclosures by their index in `enclosures`, and cables by id within each.
- Positions are optional (slot units: x a multiple of 253, y a multiple of 310). Enclosures
  without them are laid out from the feed.
- The same shape rules as a save apply (enclosure-state.md): unknown types, a splice on a
  missing cable or a port past the count, a strand to itself, a cable id used twice are
  refused with the enclosure's label and the reason.
- Limits: 20 MB, 2,000 enclosures. The organization needs room under its plan, and the
  person must be allowed to create projects in it. The Import button shows only where a
  project can be created; if it is missing, say so, and do not delete anything to make room.

Tell the person what did not come across. Every tool has something it never stored.
