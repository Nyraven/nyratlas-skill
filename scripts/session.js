// NyrAtlas skill: who is signed in, and what every call needs. Paste into the console of an
// open NyrAtlas tab on any page behind the login (the dashboard, a project). Prints the
// person's name and the organizations and projects they can reach, and leaves helpers on
// window.nyr for the other scripts. Writes nothing; never signs in.
//
//   window.nyr.csrf()      the page's CSRF token, sent as X-CSRF-TOKEN on every write
//   window.nyr.version()   the page's asset version, sent as X-Inertia-Version on page reads
//   window.nyr.page()      the open page's Inertia payload { component, props, url, version }
//   await window.nyr.whoami()   { name, email, projects: [{ org, orgUlid, name, ulid, type }] }
(async () => {
    const nyr = window.nyr ?? (window.nyr = {});

    // The page's own payload: Inertia writes it into a JSON script tag next to the app root
    // (older builds put it on the root's data-page attribute; both are read).
    nyr.page = () => {
        const tag = document.querySelector('script[data-page="app"]');
        const raw = tag?.textContent || document.getElementById('app')?.dataset?.page;
        if (!raw) throw new Error('no NyrAtlas page here: open the dashboard or a project while signed in');
        return JSON.parse(raw);
    };
    nyr.version = () => nyr.page().version;
    nyr.csrf = () => {
        const token = document.querySelector('meta[name="csrf-token"]')?.content;
        if (!token) throw new Error('no CSRF token on this page; reload the tab');
        return token;
    };
    nyr.whoami = async () => {
        const r = await fetch('/dashboard', { credentials: 'same-origin', redirect: 'manual',
            headers: { 'X-Inertia': 'true', 'X-Inertia-Version': nyr.version(), 'Accept': 'application/json' } });
        if (r.status === 409) throw new Error('the page is stale (asset version changed); reload the tab and run this again');
        if (!r.ok) throw new Error(`not signed in (${r.status}); the person signs in, you do not`);
        const dash = await r.json();
        const projects = [];
        for (const org of dash.props.orgTree ?? []) {
            for (const p of org.projects ?? org.maps ?? []) {
                projects.push({ org: org.name, orgUlid: org.ulid, name: p.name, ulid: p.ulid, type: p.type });
            }
        }
        return { name: dash.props.auth?.user?.name ?? null, email: dash.props.auth?.user?.email ?? null, projects };
    };

    const me = await nyr.whoami();
    console.log(`nyr: signed in as ${me.name ?? 'unknown'}; ${me.projects.length} project(s) reachable`);
    console.table(me.projects);
    console.log('nyr: csrf, version, page, whoami ready. Next: scripts/read-state.js and scripts/save-state.js');
    return me;
})();
