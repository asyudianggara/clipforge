const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs-extra');

// Set path binary FFmpeg secara eksplisit
ffmpeg.setFfmpegPath(ffmpegPath);

const extractAudio = (videoPath) => {
  return new Promise((resolve, reject) => {
    const outputDir = path.dirname(videoPath);
    const fileName = path.basename(videoPath, path.extname(videoPath));
    const audioPath = path.join(outputDir, `${fileName}.mp3`);

    console.log(`Extracting audio from ${videoPath} to ${audioPath}`);

    ffmpeg(videoPath)
      .toFormat('mp3')
      .on('end', () => {
        console.log('Audio extraction finished');
        resolve(audioPath);
      })
      .on('error', (err) => {
        console.error('Error extracting audio:', err);
        reject(err);
      })
      .save(audioPath);
  });
};

module.exports = {
  extractAudio
};
