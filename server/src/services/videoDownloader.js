const youtubedl = require('youtube-dl-exec');
const fs = require('fs-extra');
const path = require('path');

const DOWNLOAD_DIR = path.join(__dirname, '../../downloads');

// Pastikan folder downloads ada
fs.ensureDirSync(DOWNLOAD_DIR);

const downloadVideo = async (url, jobId) => {
  try {
    const outputTemplate = path.join(DOWNLOAD_DIR, `${jobId}.%(ext)s`);
    
    console.log(`Starting download for Job ${jobId} from URL: ${url}`);

    // Robust flags to bypass YouTube blocks and ensure good quality
    const options = {
      output: outputTemplate,
      format: 'best[ext=mp4]/best',
      noCheckCertificates: true,
      noPlaylist: true,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      extractorArgs: 'youtube:player_client=android,web',
    };

    console.log('Download options:', JSON.stringify(options, null, 2));

    const result = await youtubedl(url, options);
    console.log('yt-dlp execution finished');

    // Cari file yang baru dibuat
    const files = await fs.readdir(DOWNLOAD_DIR);
    const downloadedFile = files.find(f => f.startsWith(jobId));

    if (!downloadedFile) {
      throw new Error('File not found after download');
    }

    const filePath = path.join(DOWNLOAD_DIR, downloadedFile);
    
    // Validasi ukuran file
    const stats = await fs.stat(filePath);
    console.log(`Download complete: ${filePath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    
    if (stats.size < 1024) {
      throw new Error('Downloaded file is too small, likely corrupted or empty');
    }
    
    return filePath;

  } catch (error) {
    console.error('Download failed:', error);
    throw new Error(`Failed to download video: ${error.message}`);
  }
};

module.exports = {
  downloadVideo
};
