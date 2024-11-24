const express = require('express');
const multer = require('multer');
const path = require('path');
const Session = require('../models/session');

const router = express.Router();

// Multer setup for local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        cb(null, uploadPath); // Files are saved in the "uploads" folder
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName); // Format: timestamp-originalname
    },
});

const upload = multer({ storage });

// Generate a Key
router.post('/generate-key', async (req, res) => {
    try {
        const key = Math.random().toString(36).substr(2, 9); // Generate a unique key
        const session = new Session({ key });
        await session.save();

        res.status(201).json({ key });
    } catch (error) {
        res.status(500).json({ message: 'Error generating key', error: error.message });
    }
});

// Check Photo Status
router.get('/check-status/:key', async (req, res) => {
    try {
        const session = await Session.findOne({ key: req.params.key });

        if (!session) return res.status(404).json({ message: 'Session not found' });

        res.json({
            status: session.status,
            photoUrl: session.photoUrl ? `http://localhost:3000${session.photoUrl}` : null,
            finalUrl: session.finalUrl ? `http://localhost:3000${session.finalUrl}` : null,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving session', error: error.message });
    }
});

// // Upload Photo
// router.post('/upload-photo', upload.single('photo'), async (req, res) => {
//     try {
//         const { key } = req.body; // Get session key from request body
//         const session = await Session.findOne({ key });

//         if (!session) return res.status(404).json({ message: 'Session not found' });

//         const photoUrl = `/uploads/${req.file.filename}`; // Local file path
//         session.status = 'uploaded';
//         session.photoUrl = photoUrl;
//         await session.save();

//         res.json({ message: 'Photo uploaded successfully', photoUrl: `http://localhost:3000${photoUrl}` });
//     } catch (error) {
//         res.status(500).json({ message: 'Error uploading photo', error: error.message });
//     }
// });

// Upload the photo and update the session with the photo URL
router.post('/upload-photo', upload.single('photo'), async (req, res) => {
  const { key } = req.body;
  const photoPath = req.file ? '/uploads/' + req.file.filename : null;

  if (!key || !photoPath) {
    return res.status(400).json({ message: 'Session key and photo are required' });
  }

  try {
    const session = await Session.findOne({ key });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Update session with the photo URL and status
    session.photoUrl = photoPath;
    session.status = 'uploaded'; // Set the status to 'uploaded'
    await session.save();

    res.status(200).json({ message: 'Photo uploaded successfully', photoUrl: photoPath });
  } catch (err) {
    console.error('Error uploading photo:', err);
    res.status(500).json({ message: 'Error uploading photo' });
  }
});

// Upload Final Photo
router.post('/upload-final', upload.single('finalPhoto'), async (req, res) => {
    try {
        const { key } = req.body; // Get session key from request body
        const session = await Session.findOne({ key });

        if (!session) return res.status(404).json({ message: 'Session not found' });

        const finalUrl = `/uploads/${req.file.filename}`; // Local file path
        session.status = 'processed';
        session.finalUrl = finalUrl;
        await session.save();

        res.json({ message: 'Final photo uploaded successfully', finalUrl: `http://localhost:3000${finalUrl}` });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading final photo', error: error.message });
    }
});

// Download Final Photo
router.get('/download-photo/:key', async (req, res) => {
    try {
        const session = await Session.findOne({ key: req.params.key });

        if (!session) return res.status(404).json({ message: 'Session not found' });
        if (!session.finalUrl) return res.status(400).json({ message: 'Final photo not available' });

        const filePath = path.join(__dirname, '..', session.finalUrl);
        res.download(filePath, (err) => {
            if (err) {
                console.error('Error downloading file:', err.message);
                res.status(500).json({ message: 'Error downloading file' });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving photo', error: error.message });
    }
});

module.exports = router;
