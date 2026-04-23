const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs-extra');

// Set path binary FFmpeg secara eksplisit
ffmpeg.setFfmpegPath(ffmpegPath);

const cutAndProcessVideo = (videoPath, segments, jobId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Ensure downloads directory exists
      const outputDir = path.join(__dirname, '../../downloads'); 
      fs.ensureDirSync(outputDir);
      
      const processedFiles = [];

      // Proses setiap segmen secara berurutan (bisa diparallelkan jika resource kuat)
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const outputFilename = `${jobId}_clip_${i + 1}.mp4`;
        const outputPath = path.join(outputDir, outputFilename);

        // Validasi: AI mengembalikan start_time/end_time
        // Gunakan Number() untuk memastikan tipe data angka dan cegah NaN
        const start = Number(seg.start_time || seg.start || 0);
        const end = Number(seg.end_time || seg.end || 0);
        const duration = end - start;

        console.log(`Processing clip ${i + 1}: ${start}s to ${end}s (Duration: ${duration}s)`);
        console.log(`CWD: ${process.cwd()}`);

        // Skip jika data tidak valid
        if (isNaN(start) || isNaN(end) || duration <= 0) {
          console.warn(`Skipping clip ${i + 1} due to invalid timestamps: start=${start}, end=${end}`);
          continue;
        }

        // STRATEGY: Use ABSOLUTE path with FFmpeg-safe escaping for Windows
        // 1. Get absolute path (already have tempAssPath)
        // 2. Replace backslashes with forward slashes
        // 3. Escape the drive letter colon (e.g. "D:" -> "D\:")
        // 4. Wrap in single quotes '...'
        const tempAssFilename = `temp_${jobId}_${i}.ass`;
        const tempAssPath = path.join(outputDir, tempAssFilename);
        const ffmpegSafeAssPath = tempAssPath.replace(/\\/g, '/').replace(':', '\\:');

        const { generateSRT } = require('./subtitleGenerator'); // Actually generateASS now
        // Generate ASS directly
        generateSRT(seg.text || '', 0, duration, tempAssPath);

        await new Promise((res, rej) => {
          // Ensure crop width is an even integer
          const cropFilter = 'crop=trunc(ih*9/16):ih'; 

          ffmpeg(videoPath)
            .inputOptions([`-ss ${start}`]) 
            .duration(duration)
            .videoFilters([
              cropFilter, 
              'scale=1080:1920',
              // Use ASS file with safe absolute path.
              `subtitles='${ffmpegSafeAssPath}'`
            ])
            .output(outputPath)
            .on('start', (commandLine) => {
              console.log(`Spawned Ffmpeg with command: ${commandLine}`);
              console.log(`Using stats: CWD=${process.cwd()}, ASS=${tempAssFilename}`);
            })
            .on('end', () => {
              console.log(`Clip ${i + 1} created: ${outputPath}`);
              processedFiles.push({
                path: outputPath,
                filename: outputFilename,
                info: seg
              });
              // Cleanup strict temp file
              fs.remove(tempAssPath).catch(err => console.error('ASS cleanup failed:', err));
              res();
            })
            .on('error', (err) => {
              console.error(`Error processing clip ${i + 1}:`, err);
              // Attempt cleanup on error too
              fs.remove(tempAssPath).catch(() => {});
              rej(err);
            })
            .run();
        });
      }

      resolve(processedFiles);

    } catch (error) {
      console.error('Video processing failed:', error);
      reject(error);
    }
  });
};

module.exports = {
  cutAndProcessVideo
};
