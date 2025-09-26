const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = 3001;

// Izinkan CORS dari frontend Anda (sesuaikan dengan asal frontend Anda)
app.use(cors({
  origin: 'http://localhost:5173', // Ganti dengan asal frontend Anda jika berbeda
}));

// Siapkan penyimpanan multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'generated_audio');
    // Pastikan direktori ada
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post('/save-audio', upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No audio file uploaded.');
  }
  console.log(`Audio file saved: ${req.file.path}`);
  res.status(200).send('Audio file saved successfully.');
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
