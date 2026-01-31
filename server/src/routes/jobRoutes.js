const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Configure Multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    fs.ensureDirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB limit
});

router.post('/', jobController.createJob);
router.post('/upload', upload.single('video'), jobController.createUploadJob);
router.get('/:id', jobController.getJobStatus);

module.exports = router;
