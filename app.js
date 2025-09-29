// app.js - base server

const express = require('express');
const app = express();

// health check
app.get('/', (req, res) => res.send('OK'));

// error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error', message:err.message });
});

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Server on http://localhost:${PORT}`); });

// callback-based fake API (with 1sec delay)
function simulateApiCallback(id, cb) {
    setTimeout(() => {
        try {
            if (!id && id !== 0) throw new Error('Missing id');
            const data = { id, name: 'Gabriel Hernandez' };
            cb(null, data);
        } catch (err) { cb(err); }
    }, 1000);
}
// uses the callback helper
app.get ('/callback', (req, res, next) => {
    const id = Number(req.query.id ?? 1);
    simulateApiCallback(id, (err, data) => {
        if (err) return next(err);
        res.json({ source: 'callback', data });
    });
});

// promise wrapper around the callback helper
function simulateApiPromise(id) {
    return new Promise((resolve, reject) => {
        simulateApiCallback(id, (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });
}

app.get ('/promise', (req, res, next) => {
    const id = Number(req.query.id ?? 2);
    simulateApiPromise(id)
        .then(data => res.json({ source: 'promise', data }))
        .catch(next);
});

// async/await wrapper using the promise version
async function simulateApiAsync(id) {
    return await simulateApiPromise(id);
}

app.get ('/async', async (req, res, next) => {
    try {
        const id = Number(req.query.id ?? 3);
        const data = await simulateApiAsync(id);
        res.json({ source: 'async/await', data });
    } catch (err) {
        next(err);
    }
});

const fs = require('fs');
const fsp = fs.promises;

// reads file asynchronously  - default path = ./data/sample.txt
app.get('/file', async (req, res, next) => {
    const path = req.query.path || './data/sample.txt';
    try {
        const content = await fsp.readFile(path, 'utf8');
        res.json({ path, legnth: content.length, content });
    } catch (err) {
        if (err.code === 'ENOENT') {
            return res.status(404).json({
                error: 'File Not Found',
                hint: 'Create .data/sample.txt or pass ?path= to an existing file',
            });
        }
        next(err);
    }
});

function simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

app.get('/chain', async (req, res, next) => {
    try {
        const steps = [];
        await simulateDelay(300);
        steps.push('Login complete');
        await simulateDelay(300);
        steps.push('Fetched user data');
        await simulateDelay(300);
        steps.push('Rendered UI');
        res.json({ steps });
    } catch (err) {
        next(err);
    }
})
