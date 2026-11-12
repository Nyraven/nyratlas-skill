// NyrAtlas skill: check what the enclosure canvas is drawing. Run it on the enclosure page
// (/map/{map}/enclosure/{nodeUlid}) after a reload, so the canvas shows what the server
// holds. Writes nothing.
//
//   window.nyr.verifyEnclosure({ splices: 6 })
//     -> { ok, drawn: { splices, stages }, expected, notes }
//
// The enclosure's drawing is the last canvas stage on the page (the project map keeps its own
// behind it). Splice lines carry ids that start with "splice-". A short count means the page
// was not reloaded after the save, or this is not the enclosure you saved.
(() => {
    const nyr = window.nyr ?? (window.nyr = {});
    nyr.verifyEnclosure = (expected = {}) => {
        const notes  = [];
        const stages = window.Konva?.stages ?? [];
        if (!stages.length) {
            return { ok: false, drawn: { splices: 0, stages: 0 }, expected, notes: ['no canvas on this page; open the enclosure first'] };
        }
        const stage   = stages[stages.length - 1];
        const splices = stage.find('Line').filter(n => (n.id() || '').startsWith('splice-')).length;
        const drawn   = { splices, stages: stages.length };
        if (!location.pathname.includes('/enclosure/')) notes.push('this is not an enclosure page; the count is from another canvas');
        if (expected.splices != null && expected.splices !== splices) notes.push(`expected ${expected.splices} splices drawn, see ${splices}`);
        const ok = notes.length === 0;
        console.log(`nyr: ${ok ? 'drawn as expected' : 'mismatch'}`, drawn, notes);
        return { ok, drawn, expected, notes };
    };
    console.log('nyr: verifyEnclosure ready');
})();
