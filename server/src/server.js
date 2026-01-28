const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const jobRoutes = require('./routes/jobRoutes');

app.use(cors());
app.use(express.json());

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
