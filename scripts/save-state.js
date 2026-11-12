// NyrAtlas skill: save one enclosure the way the editor does. Needs scripts/session.js run
// first. Nothing here writes until you call window.nyr.save.
//
//   await window.nyr.save(mapUlid, nodeUlid, doc => { ...change doc...; return doc })
//
// save() reads the enclosure's state, hands you a copy of { cables, splices, cable_seq } to
// change, sends the whole document back with the version it read, and:
//   - on 204 reads the state back until the version moves (up to ten seconds) and resolves
//       { ok: true, before, after, settled, state }  (settled is false only when the save
//                                                     changed nothing, or the worker is behind)
//   - on 409 (someone else saved first) waits for their save to settle, reads the enclosure
//     again, applies your change function once more and sends once more; a second 409 resolves
//       { ok: false, status: 409, by, body }        stop and tell the person who saved
//   - on anything else resolves { ok: false, status, body } with the server's answer
// Your change function must build on the doc it is given (that is what makes the rebase
// correct) and must keep every field it did not set. Helpers for the ids:
//   nyr.nextCableId(doc)            cable_seq + 1, never a reused id
//   nyr.nextSpliceId(doc)           highest splice id + 1
//   nyr.nextSortOrder(doc, side)    the next position down that side
//   nyr.standardOf(doc)             the color standard the enclosure's fiber cables use, or null
(() => {
    const nyr = window.nyr ?? (window.nyr = {});
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    const clone = (o) => JSON.parse(JSON.stringify(o));

    nyr.nextCableId   = (doc) => Math.max(doc.cable_seq ?? 0, ...doc.cables.map(c => c.id), 0) + 1;
    nyr.nextSpliceId  = (doc) => Math.max(0, ...doc.splices.map(s => s.id ?? 0)) + 1;
    nyr.nextSortOrder = (doc, side) => Math.max(-1, ...doc.cables.filter(c => c.side === side).map(c => c.sortOrder ?? 0)) + 1;
    nyr.standardOf    = (doc) => doc.cables.find(c => (c.type ?? 'fiber_cable') === 'fiber_cable' && c.standard)?.standard ?? null;

    nyr.save = async (map, node, change) => {
        const path = `/map/${map}/enclosure/${node}/state`;
        const read = async () => {
            const r = await fetch(path, { credentials: 'same-origin', headers: { Accept: 'application/json' } });
            if (!r.ok) throw Object.assign(new Error(`${r.status} on GET ${path}`), { status: r.status });
            return r.json();
        };
        let base = await read();
        for (let attempt = 1; attempt <= 2; attempt++) {
            const doc = await change(clone({ cables: base.cables, splices: base.splices, cable_seq: base.cable_seq }));
            if (!doc || !Array.isArray(doc.cables) || !Array.isArray(doc.splices)) {
                throw new Error('the change function must return the doc it was given, with cables and splices arrays');
            }
            // The high-water mark never goes down and always covers every id in use.
            doc.cable_seq = Math.max(base.cable_seq ?? 0, doc.cable_seq ?? 0, ...doc.cables.map(c => c.id), 0);
            const r = await fetch(path, {
                method: 'PUT', credentials: 'same-origin',
                headers: { 'X-CSRF-TOKEN': nyr.csrf(), 'Accept': 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...doc, version: base.version }),
            });
            if (r.status === 204) {
                // The save settles through a queue a moment later: usually within a second or
                // two, longer when the worker is between polls. Read back until the version
                // moves, up to ten seconds. A save that changed nothing never moves it.
                let state = base;
                for (let waited = 0; waited < 10000; waited += 500) {
                    await sleep(500);
                    state = await read();
                    if (state.version > base.version) break;
                }
                return { ok: true, before: base.version, after: state.version, settled: state.version > base.version, state };
            }
            const body = await r.json().catch(() => null);
            if (r.status === 409 && body?.reason === 'conflict' && attempt === 1) {
                // Their save may still be settling (a second or so). Wait it out, then read the
                // enclosure fresh rather than building on the 409 body, so the version sent next
                // is the one their save produced.
                console.warn(`nyr: ${body.by ?? 'someone'} saved this enclosure first; waiting for it to settle, then applying the change once more`);
                await sleep(1500);
                base = await read();
                continue;
            }
            return { ok: false, status: r.status, by: body?.by ?? null, body };
        }
    };
    console.log('nyr: save, nextCableId, nextSpliceId, nextSortOrder, standardOf ready');
})();
