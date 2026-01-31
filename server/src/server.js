const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const jobRoutes = require('./routes/jobRoutes');

app.use(cors());
app.use(express.json());

// Serve static files from downloads and uploads directory
const path = require('path');
const fs = require('fs-extra');
const UPLOADS_DIR = path.join(__dirname, '../uploads');
fs.ensureDirSync(UPLOADS_DIR);

app.use('/downloads', express.static(path.join(__dirname, '../downloads')));
app.use('/uploads', express.static(UPLOADS_DIR));

app.use('/api/jobs', jobRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'CLIPFORGE API Gateway is active', status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start the Worker
  require('./workers/videoWorker');
  console.log('Worker is running...');
});
