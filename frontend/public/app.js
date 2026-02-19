async function checkBackend() {
    const statusEl = document.getElementById('status');
    const outEl = document.getElementById('output');

    statusEl.className = 'status';
    statusEl.textContent = 'Checking…';

    try {
        const ctrl = new AbortController();
        const to = setTimeout(() => ctrl.abort(), 5000);

        const res = await fetch('/api/ping', { signal: ctrl.signal });
        clearTimeout(to);

        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();

        statusEl.className = 'status ok';
        statusEl.textContent = 'Connected';
        outEl.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
        statusEl.className = 'status err';
        statusEl.textContent = 'Failed';
        const msg = (err && err.name === 'AbortError') ? 'Timeout (5s)' : (err && err.message) || String(err);
        outEl.textContent = JSON.stringify({ ok: false, error: msg }, null, 2);
    }
}

document.getElementById('checkBtn').addEventListener('click', checkBackend);

// Check on load as well
checkBackend();