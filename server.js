// index.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000; // You can use any available port

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);  // Store files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Rename the file to avoid conflicts
  }
});
  
const upload = multer({ storage });

// Serve static files (like images) from the 'uploads' folder
app.use('/uploads', express.static('uploads'));

// File Upload Endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const sessionId = req.body.sessionId;  // Access the session ID from the form data
  if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is missing' });
  }

  // Generate the URL for the uploaded file
  const fileUrl = `http://localhost:${port}/uploads/${req.file.filename}`;

  // You can store the sessionId in a database or perform additional logic based on it
  console.log(`File uploaded by session: ${sessionId}`);
  
  res.json({
      success: true,
      message: 'File uploaded successfully',
      fileUrl: fileUrl,
      fileName: req.file.filename
  });
});

// Serve the HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});