const youtubedl = require('youtube-dl-exec');
const ffmpeg = require('ffmpeg-static');
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
      // Use 'best' to get the highest quality single file (usually 720p or 1080p mp4/webm)
      // This is more reliable than requesting separate streams with restricted clients
      format: 'bestvideo+bestaudio/best',
      // Ensure we merge into mp4 if it's not already
      mergeOutputFormat: 'mp4',
      ffmpegLocation: ffmpeg, // CRITICAL: Allows yt-dlp to merge/remux
      noCheckCertificates: true,
      noPlaylist: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36',
      // Try android client which is sometimes more permissive for server-side downloads
      extractorArgs: 'youtube:player_client=android',
      // Add retries and handle connection issues
      retries: 10,
      retrySleep: 5,
      noWarnings: true,
    };

    console.log('Download options (with ffmpeg):', JSON.stringify({ ...options, ffmpegLocation: 'EXISTS' }, null, 2));

    // Increase process timeout or use a more resilient way if needed
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
