// NyrAtlas skill: read a project and an enclosure. Needs scripts/session.js run first (it
// leaves window.nyr). Writes nothing.
//
//   await window.nyr.graph(mapUlid)            -> { nodes, edges }  the whole project
//   await window.nyr.state(mapUlid, nodeUlid)  -> { cables, splices, cable_seq, state, version }
//   await window.nyr.readOnly(mapUlid)         -> the preflight block (references/preflight.md)
//   await window.nyr.plannedWork(mapUlid)      -> { cans, trunks }
//   window.nyr.findNode(graph, 'KRP-09-004')   -> the node with that label, or null
//
// A node in the graph is { ulid, type, state, label, sublabel, info_line_2, x, y,
// properties: { cables, splices, cable_seq }, version }. Read the state route, not the graph,
// right before a save: it is the document the save is checked against.
(() => {
    const nyr = window.nyr ?? (window.nyr = {});
    const json = async (path, headers = {}) => {
        const r = await fetch(path, { credentials: 'same-origin', headers: { Accept: 'application/json', ...headers } });
        if (!r.ok) throw Object.assign(new Error(`${r.status} on GET ${path}`), { status: r.status, body: await r.json().catch(() => null) });
        return r.json();
    };
    nyr.graph       = (map) => json(`/map/${map}/graph`);
    nyr.state       = (map, node) => json(`/map/${map}/enclosure/${node}/state`);
    nyr.plannedWork = (map) => json(`/map/${map}/planned-work`);
    nyr.readOnly    = async (map) => (await json(`/map/${map}`, { 'X-Inertia': 'true', 'X-Inertia-Version': nyr.version() })).props.readOnly;
    nyr.findNode    = (graph, label) => graph.nodes.find(n => n.label === label) ?? null;
    console.log('nyr: graph, state, plannedWork, readOnly, findNode ready');
})();
