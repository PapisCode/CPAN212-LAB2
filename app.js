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
