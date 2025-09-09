const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

async function initializeDataFile() {
    try {
        await fs.access(DATA_FILE);
    } catch (error) {
        await fs.writeFile(DATA_FILE, JSON.stringify({ items: [] }));
    }
}

async function readData() {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
}

async function writeData(data) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/wishlist', async (req, res) => {
    try {
        const data = await readData();
        const wishlist = data.items || [];
        res.json({ items: wishlist });
    } catch (error) {
        res.status(500).json({ error: 'Failed to read wishlist' });
    }
});

app.post('/api/wishlist', async (req, res) => {
    try {
        const { items } = req.body;
        await writeData({ items });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save wishlist' });
    }
});

app.delete('/api/wishlist', async (req, res) => {
    try {
        await writeData({ items: [] });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear wishlist' });
    }
});

initializeDataFile().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});