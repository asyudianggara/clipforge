const videoQueue = require('../queues/videoQueue');
const { v4: uuidv4 } = require('uuid');

const createJob = async (req, res) => {
  try {
    const { url, provider = 'local', apiKey = null, clipCount = 3 } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL video diperlukan' });
    }

    // Validasi URL sederhana
    if (!url.includes('youtube.com') && !url.includes('youtu.be') && !url.includes('tiktok.com')) {
      return res.status(400).json({ error: 'URL tidak valid. Dukungan saat ini: YouTube, TikTok' });
    }

    const jobId = uuidv4();
    
    console.log(`Creating job with provider: ${provider}, clipCount: ${clipCount}`);
    
    // Menambahkan job ke antrian dengan provider & API Key
    await videoQueue.add({
      id: jobId,
      url,
      provider: provider || 'local',
      apiKey: apiKey || null,
      clipCount: Number(clipCount) || 3,
      status: 'pending',
      createdAt: new Date()
    }, {
      jobId: jobId
    });

    res.status(201).json({
      message: 'Job berhasil dibuat',
      jobId,
      provider: provider || 'local',
      status: 'queued'
    });

  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Gagal membuat job processing' });
  }
};

const getJobStatus = async (req, res) => {
  const { id } = req.params;
  const job = await videoQueue.getJob(id); // Note: Bull uses its own IDs usually, handle mapping carefully
  
  // Jika menggunakan custom ID di data job, kita perlu cari manual atau gunakan ID Bull.
  // Untuk simplifikasi, anggap kita return status dummy dulu jika job tidak ditemukan di Bull simple getters
  
  if (!job) {
    return res.status(404).json({ error: 'Job tidak ditemukan' });
  }
  
  const state = await job.getState();
  const progress = job._progress;

  res.json({
    id,
    state,
    progress,
    result: job.returnvalue || null,
    error: job.failedReason || null
  });
};

const createUploadJob = async (req, res) => {
  try {
    const { provider = 'local', apiKey = null, clipCount = 3 } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'File video tidak ditemukan' });
    }

    const jobId = uuidv4();
    const filePath = file.path;

    console.log(`Creating upload job with provider: ${provider}, clipCount: ${clipCount}`);
    console.log(`File: ${file.originalname} saved at ${filePath}`);

    await videoQueue.add({
      id: jobId,
      url: null, // No URL for local files
      isLocalFile: true,
      filePath: filePath,
      fileName: file.originalname,
      provider: provider || 'local',
      apiKey: apiKey || null,
      clipCount: Number(clipCount) || 3,
      status: 'pending',
      createdAt: new Date()
    }, {
      jobId: jobId
    });

    res.status(201).json({
      message: 'Job upload berhasil dibuat',
      jobId,
      provider: provider || 'local',
      status: 'queued'
    });

  } catch (error) {
    console.error('Error creating upload job:', error);
    res.status(500).json({ error: 'Gagal membuat job processing untuk file upload' });
  }
};

module.exports = {
  createJob,
  getJobStatus,
  createUploadJob
};
