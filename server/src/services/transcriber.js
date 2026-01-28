const fs = require('fs');
const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const transcribeAudio = async (audioPath, apiKey) => {
  try {
    console.log(`Transcribing audio: ${audioPath}`);
    
    // Gunakan Key dari parameter atau env
    const activeKey = apiKey || process.env.OPENAI_API_KEY;

    if (!activeKey) {
      throw new Error('OPENAI_API_KEY not found (Env or Request)');
    }

    const openai = new OpenAI({
      apiKey: activeKey,
    });

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"] // Mendapatkan timestamp detail
    });

    console.log('Transcription complete');
    return transcription;

  } catch (error) {
    console.error('Transcription failed:', error);
    throw error;
  }
};

module.exports = {
  transcribeAudio
};
