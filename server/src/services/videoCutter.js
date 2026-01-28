const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs-extra');

const cutAndProcessVideo = (videoPath, segments, jobId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const outputDir = path.dirname(videoPath);
      const processedFiles = [];

      // Proses setiap segmen secara berurutan (bisa diparallelkan jika resource kuat)
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const outputFilename = `${jobId}_clip_${i + 1}.mp4`;
        const outputPath = path.join(outputDir, outputFilename);

        console.log(`Processing clip ${i + 1}: ${seg.start}s to ${seg.end}s`);

        await new Promise((res, rej) => {
          ffmpeg(videoPath)
            .setStartTime(seg.start)
            .setDuration(seg.end - seg.start)
            // Filter kompleks untuk Vertical 9:16
            // 1. Crop center ke rasio aspect yang mendekati
            // 2. Scale ke 1080x1920
            // Catatan: Ini crop sederhana (center). Smart crop butuh deteksi objek (kompleks).
            .videoFilters([
              'crop=ih*(9/16):ih', // Crop center width
              'scale=1080:1920'    // Resize HD Vertical
            ])
            .output(outputPath)
            .on('end', () => {
              console.log(`Clip ${i + 1} created: ${outputPath}`);
              processedFiles.push({
                path: outputPath,
                info: seg
              });
              res();
            })
            .on('error', (err) => {
              console.error(`Error processing clip ${i + 1}:`, err);
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
