const OpenAI = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const analyzeContent = async (transcript, apiKey) => {
  try {
    console.log('Analyzing content for viral segments...');

    const activeKey = apiKey || process.env.OPENAI_API_KEY;

    if (!activeKey) {
      console.warn('OPENAI_API_KEY missing. Returning dummy segments.');
      return [
        { start: 10, end: 40, summary: "Simulated Viral Clip 1", score: 85 },
        { start: 60, end: 90, summary: "Simulated Viral Clip 2", score: 90 }
      ];
    }

    const openai = new OpenAI({
      apiKey: activeKey,
    });

    // Persiapkan prompt untuk LLM
    // Asumsi format transcript dari Whisper
    const transcriptText = transcript.text || JSON.stringify(transcript);

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview", // Gunakan model pintar
      messages: [
        {
          role: "system",
          content: `You are an expert video editor for TikTok/Reels. 
          Analyze the following transcript. Identify 3-5 most "viral" segments.
          Each segment MUST be between 30 and 60 seconds.
          Return ONLY a JSON array with objects containing:
          - "start": (number, start time in seconds)
          - "end": (number, end time in seconds)
          - "summary": (string, short description)
          - "score": (number, 0-100 viral potential)
          
          Ensure segments do not overlap.`
        },
        {
          role: "user",
          content: `TRANSCRIPT:\n${transcriptText.substring(0, 15000)}` // Limit token jika perlu
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    console.log('Analysis complete:', result);
    
    // Handle jika return di dalam key seperti { "segments": [...] }
    return result.segments || result;

  } catch (error) {
    console.error('Content analysis failed:', error);
    // Fallback data agar worker tidak crash total
    return [
      { start: 0, end: 30, summary: "Fallback segment (Error in AI)", score: 0 }
    ];
  }
};

module.exports = {
  analyzeContent
};
