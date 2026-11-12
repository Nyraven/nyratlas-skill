# Every answer, and what to do with it

The server answers JSON when asked with `Accept: application/json`. Write calls answer `204`
with no body, or an error with `message` and, for `422`, `errors` keyed by field.

| Status | When | Recovery |
|---|---|---|
| `200` with a body | A read, or a create that returns the new object | Use it |
| `204` | A write landed. An enclosure save still settles a moment later, through a queue | Read back until the version moves, verify (verify.md) |
| `302` to `/login`, or `401` | The session is gone | Stop. The person signs in; you never do |
| `403` | The person's role does not allow it; the project is outside its plan (`message` says so); or the route belongs to a part of the product this account does not have | Report `message` as written. Do not retry, do not try another route to the same end |
| `404` | Not the person's to see: another organization's project, a draft they may not see, a ulid that does not exist | Do not retry. Do not probe other ids |
| `409` on `PUT .../state` | `{ reason: "conflict", by, version, cables, splices, cable_seq, hasDrafts }`: another person saved first, or their save is still settling | Take the body as the new base, reapply your change, send once. A second 409: stop, name `by` |
| `409` on a page route read with `X-Inertia` | The `X-Inertia-Version` you sent is stale (a deploy happened) | Reload the tab, read the version from the page again |
| `419` | The CSRF token is stale or the session rotated | Reload the tab, read the token again, start the step over |
| `422` | The body is out of shape. `errors` names each field | Fix the field named. Never loosen the shape to get past it |
| `429` | More than the per-person write rate (hundreds a minute) | You are looping. Wait `Retry-After` seconds, then continue once |
| `500` | Something broke on the server | Stop and tell the person exactly what you sent, minus nothing; do not retry in a loop |

Rules that hold across all of them:

- A `403` or `404` is final for the session. "Try again" is never the answer to either.
- One rebase per save. A second `409` means a person is working in that enclosure right now;
  the right move is to tell your person and let them talk.
- A refused save (`422`) stored nothing and moved no version. The `version` you read is still
  good for the corrected body.
- Read-after-write is part of every write. A `204` is a promise, not a proof.
