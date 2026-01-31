const videoQueue = require('../queues/videoQueue');
const { downloadVideo } = require('../services/videoDownloader');
const { extractAudio } = require('../services/audioExtractor');
const { cutAndProcessVideo } = require('../services/videoCutter');
const { AIProviderFactory } = require('../services/aiProviderFactory');

// Proses job di sini
videoQueue.process(async (job) => {
  const { id, url, provider = 'local', apiKey = null, clipCount = 3 } = job.data;
  
  console.log(`Processing Job ID: ${id}`);
  console.log(`  URL: ${url}`);
  console.log(`  Provider: ${provider}`);
  console.log(`  API Key: ${apiKey ? 'Provided' : 'Not provided (using free mode)'}`);
  
  let videoPath = null;
  let audioPath = null;
  let transcript = null;
  let viralSegments = null;
  let outputFiles = [];

  try {
    // 1. Update Progress: Handle Video (Download or Local)
    await job.progress(10);
    
    if (job.data.isLocalFile && job.data.filePath) {
      console.log('Step 1: Using Uploaded Local Video...');
      videoPath = job.data.filePath;
      // Optional: Check if file still exists
      const fs = require('fs-extra');
      if (!await fs.exists(videoPath)) {
        throw new Error('Local video file not found at ' + videoPath);
      }
    } else {
      console.log('Step 1: Downloading Video...');
      videoPath = await downloadVideo(url, id);
    }

    // 2. Update Progress: Extract Audio
    await job.progress(25);
    console.log('Step 2: Extracting Audio...');
    audioPath = await extractAudio(videoPath);

    // 3. Update Progress: Transcribe with Dynamic Provider
    await job.progress(40);
    console.log('Step 3: Transcribing Audio...');
    
    const transcriber = AIProviderFactory.createTranscriber(provider, apiKey);
    console.log(`Using transcriber: ${transcriber.constructor.name}`);
    
    // Transcribe method returns string directly
    const transcriptText = await transcriber.transcribe(audioPath);
    transcript = { text: transcriptText }; // Wrap for compatibility

    // 4. Update Progress: Analyze Content with Dynamic Provider
    await job.progress(60);
    console.log('Step 4: Analyzing Content...');
    
    const analyzer = AIProviderFactory.createAnalyzer(provider, apiKey);
    console.log(`Using analyzer: ${analyzer.constructor.name}`);
    
    viralSegments = await analyzer.analyzeContent(transcriptText, 0, clipCount);
    console.log(`Found ${viralSegments.length} segments`);

    // 5. Update Progress: Cut & Process Videos
    await job.progress(80);
    console.log('Step 5: Cutting & Processing Videos...');
    outputFiles = await cutAndProcessVideo(videoPath, viralSegments, id);

    // 6. Complete
    await job.progress(100);
    console.log('Job Complete!');
    
    return {
      status: 'completed',
      provider: provider,
      originalVideo: videoPath,
      segments: outputFiles,
      analyzedSegments: viralSegments
    };

  } catch (error) {
    console.error('Job Failed:', error);
    throw new Error(error.message);
  }
});

console.log('Worker is running...');

