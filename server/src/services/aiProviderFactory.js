/**
 * AI Provider Factory
 * 
 * Factory pattern untuk create transcriber dan analyzer
 * berdasarkan provider yang dipilih user.
 */

const { LocalWhisperTranscriber } = require('./providers/localWhisperTranscriber');
const { RuleBasedAnalyzer } = require('./providers/ruleBasedAnalyzer');

// Cloud providers (akan use API key yang di-pass user)
const OpenAI = require('openai');

class AIProviderFactory {
  /**
   * Create transcriber instance based on provider
   * @param {string} provider - 'local', 'openai', 'gemini', 'openrouter'
   * @param {string} apiKey - API key (null for local)
   * @returns {Object} Transcriber instance
   */
  static createTranscriber(provider = 'local', apiKey = null) {
    console.log(`Creating transcriber: ${provider}`);
    
    switch (provider.toLowerCase()) {
      case 'openai':
        if (!apiKey) {
          console.warn('OpenAI selected but no API key provided. Falling back to local.');
          return new LocalWhisperTranscriber();
        }
        return new OpenAITranscriber(apiKey);
      
      case 'gemini':
        console.warn('Gemini transcription not yet implemented. Falling back to local.');
        return new LocalWhisperTranscriber();
      
      case 'openrouter':
        console.warn('OpenRouter transcription not yet implemented. Falling back to local.');
        return new LocalWhisperTranscriber();
      
      case 'local':
      default:
        return new LocalWhisperTranscriber();
    }
  }

  /**
   * Create analyzer instance based on provider
   * @param {string} provider - 'local', 'openai', 'gemini', 'openrouter'
   * @param {string} apiKey - API key (null for local)
   * @returns {Object} Analyzer instance
   */
  static createAnalyzer(provider = 'local', apiKey = null) {
    console.log(`Creating analyzer: ${provider}`);
    
    switch (provider.toLowerCase()) {
      case 'openai':
        if (!apiKey) {
          console.warn('OpenAI selected but no API key provided. Falling back to rule-based.');
          return new RuleBasedAnalyzer();
        }
        return new OpenAIAnalyzer(apiKey);
      
      case 'gemini':
        console.warn('Gemini analyzer not yet implemented. Falling back to rule-based.');
        return new RuleBasedAnalyzer();
      
      case 'openrouter':
        console.warn('OpenRouter analyzer not yet implemented. Falling back to rule-based.');
        return new RuleBasedAnalyzer();
      
      case 'local':
      default:
        return new RuleBasedAnalyzer();
    }
  }
}

/**
 * OpenAI Transcriber (Wrapper)
 */
class OpenAITranscriber {
  constructor(apiKey) {
    this.client = new OpenAI({ apiKey });
  }

  async transcribe(audioFilePath) {
    console.log('Using OpenAI Whisper API...');
    const fs = require('fs');
    
    try {
      const transcription = await this.client.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: 'whisper-1',
        language: 'id' // Indonesian, bisa auto-detect juga
      });
      
      console.log(`OpenAI transcription complete: ${transcription.text.length} chars`);
      return transcription.text;
    } catch (error) {
      console.error('OpenAI transcription error:', error.message);
      throw new Error(`OpenAI Transcription failed: ${error.message}`);
    }
  }

  getModelInfo() {
    return {
      provider: 'OpenAI Whisper',
      model: 'whisper-1',
      cost: '$0.006/minute',
      speed: 'Fast (~realtime)',
      accuracy: 'Excellent (98%+)'
    };
  }
}

/**
 * OpenAI Analyzer (Wrapper)
 */
class OpenAIAnalyzer {
  constructor(apiKey) {
    this.client = new OpenAI({ apiKey });
  }

  async analyzeContent(transcript, videoDuration = 0) {
    console.log('Using OpenAI GPT for content analysis...');
    
    const prompt = `Analyze this video transcript and identify 3-5 most engaging segments (30-60 seconds each) that would work well as short-form content (Instagram Reels, TikTok, YouTube Shorts).

Transcript:
${transcript}

Return JSON array with this format:
[
  {
    "title": "Eye-catching title (max 60 chars)",
    "start_time": estimated_start_seconds,
    "end_time": estimated_end_seconds,
    "reason": "Why this segment is engaging"
  }
]`;

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content curator for short-form viral videos. Return ONLY valid JSON, no markdown formatting.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      });

      const responseText = completion.choices[0].message.content.trim();
      
      // Remove markdown code blocks if present
      const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const segments = JSON.parse(jsonText);
      
      console.log(`OpenAI analysis complete: ${segments.length} segments found`);
      return segments;
      
    } catch (error) {
      console.error('OpenAI analysis error:', error.message);
      throw new Error(`OpenAI Analysis failed: ${error.message}`);
    }
  }

  getModelInfo() {
    return {
      provider: 'OpenAI GPT',
      model: 'gpt-4o-mini',
      cost: '$0.00015/1K tokens',
      speed: 'Fast',
      accuracy: 'Excellent (90%+)'
    };
  }
}

module.exports = { AIProviderFactory };
