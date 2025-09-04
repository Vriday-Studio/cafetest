const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 4000;
const DATA_PATH = path.join(__dirname, 'public', 'menuItems.json');

app.use(cors());
app.use(express.json());

// Get all menu items
app.get('/api/menu', (req, res) => {
  fs.readFile(DATA_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error reading file');
    res.json(JSON.parse(data));
  });
});

// Save menu items
app.put('/api/menu', (req, res) => {
  fs.writeFile(DATA_PATH, JSON.stringify(req.body, null, 2), err => {
    if (err) return res.status(500).send('Error writing file');
    res.send('Saved');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});