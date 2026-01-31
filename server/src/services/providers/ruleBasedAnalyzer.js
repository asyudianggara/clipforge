/**
 * Rule-Based Content Analyzer (Gratis, Tanpa AI)
 * 
 * Menganalisis transcript dan memilih segment menarik berdasarkan:
 * 1. Keyword scoring
 * 2. Sentence length optimization
 * 3. Position heuristics
 */

class RuleBasedAnalyzer {
  constructor() {
    // Keywords yang sering muncul di konten menarik
    this.importantKeywords = [
      // Insight keywords
      'penting', 'insight', 'tips', 'cara', 'rahasia', 'strategi',
      'teknik', 'metode', 'solusi', 'kunci', 'fundamental',
      'ilmu', 'daging', 'mindset', 'pol pikir', 'belajar',
      
      // Emotional keywords (Indo & English)
      'menarik', 'luar biasa', 'amazing', 'incredible', 'wow',
      'shocking', 'mengejutkan', 'unik', 'hebat', 'keren', 
      'gila', 'parah', 'kacau', 'seru', 'lucu', 'sedih', 'terharu',
      'bangga', 'takjub', 'merinding', 'emosional',

      // Educational keywords
      'pahami', 'kenapa', 'mengapa', 'bagaimana', 'tutorial', 
      'penjelasan', 'alasan', 'artinya', 'maksudnya', 
      
      // Action/Engagement keywords
      'harus', 'wajib', 'jangan', 'perlu', 'coba', 
      'lakukan', 'hindari', 'awas', 'hati-hati', 'rugi',
      'untung', 'cuan', 'sukses', 'gagal', 'kaya', 'miskin',

      // Viral/Trending Slang (Indo)
      'viral', 'trending', 'fyp', 'rame', 'spill', 'jujurly',
      'valid', 'relate', 'pov', 'plot twist', 'gemoy', 'receh'
    ];
    
    this.negativeKeywords = [
      'iklan', 'promosi', 'subscribe', 'like', 'share',
      'intro', 'outro', 'thanks for watching', 'terima kasih'
    ];
  }

  /**
   * Analyze transcript dan return segment recommendations
   * @param {string} transcript - Full transcript text
   * @param {number} videoDuration - Duration in seconds
   * @param {number} clipCount - Number of segments to return
   * @returns {Promise<Array>} Array of segment recommendations
   */
  async analyzeContent(transcript, videoDuration = 0, clipCount = 3) {
    console.log('Using Rule-Based Analyzer (Free Mode)...');
    
    // Split transcript into sentences
    const sentences = this.splitIntoSentences(transcript);
    
    // Group sentences into potential segments (30-60 seconds each)
    const segments = this.groupIntoSegments(sentences, clipCount);
    
    // Score each segment
    const scoredSegments = segments.map((segment, index) => ({
      ...segment,
      score: this.scoreSegment(segment, index, segments.length),
      index
    }));
    
    // Sort by score and take top N
    const topSegments = scoredSegments
      .sort((a, b) => b.score - a.score)
      .slice(0, clipCount);
    
    // Convert to API-compatible format
    const recommendations = topSegments.map((seg, idx) => ({
      title: `Highlight ${idx + 1}: ${this.generateTitle(seg.text)}`,
      start_time: seg.startTime,
      end_time: seg.endTime,
      reason: this.generateReason(seg),
      score: seg.score
    }));
    
    console.log(`Found ${recommendations.length} segments using rule-based analysis`);
    return recommendations;
  }

  splitIntoSentences(text) {
    // Simple sentence splitter
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10); // Filter out very short fragments
  }

  groupIntoSegments(sentences, clipCount = 3) {
    const segments = [];
    const wordsPerSecond = 2.5;
    let totalWords = 0;
    sentences.forEach(s => totalWords += s.split(/\s+/).length);
    
    // Target duration per segment based on clipCount
    const totalDuration = totalWords / wordsPerSecond;
    // Aim for segments between 30-60 seconds, but adapt to total duration
    let targetDuration = Math.min(60, Math.max(30, totalDuration / clipCount));
    
    // If total duration is very short, just split it into clipCount parts
    if (totalDuration < 90) {
      targetDuration = totalDuration / clipCount;
    }

    let currentTime = 0;
    let currentSegment = {
      text: '',
      wordCount: 0,
      startTime: Number(currentTime.toFixed(2)),
      endTime: Number(currentTime.toFixed(2))
    };
    
    sentences.forEach(sentence => {
      const words = sentence.split(/\s+/).length;
      const duration = words / wordsPerSecond;
      
      const currentDuration = currentTime - currentSegment.startTime;
      
      // If adding this sentence exceeds targetDuration, and we still need more segments
      if (currentSegment.wordCount > 0 && 
          (currentDuration + duration > targetDuration) &&
          segments.length < clipCount - 1) {
        segments.push({ ...currentSegment });
        currentSegment = {
          text: sentence,
          wordCount: words,
          startTime: Number(currentTime.toFixed(2)),
          endTime: Number((currentTime + duration).toFixed(2))
        };
      } else {
        currentSegment.text += (currentSegment.text ? ' ' : '') + sentence;
        currentSegment.wordCount += words;
        currentSegment.endTime = Number((currentTime + duration).toFixed(2));
      }
      
      currentTime += duration;
    });
    
    // ADAPTIVE SEGMENTATION: 
    // If we have fewer segments than requested even after splitting, force smaller chunks.
    if (segments.length < clipCount && totalDuration > 30) {
       // Re-run with forced equal parts
       const forcedDuration = totalDuration / clipCount;
       segments.length = 0; // Clear
       let currentForceTime = 0;
       
       // Sederhana: bagi rata kalimat agar pas jumlahnya
       const sentencesPerSegment = Math.ceil(sentences.length / clipCount);
       
       for (let i = 0; i < sentences.length; i += sentencesPerSegment) {
          const chunkSentences = sentences.slice(i, i + sentencesPerSegment);
          const chunkText = chunkSentences.join(' ');
          const chunkWords = chunkText.split(/\s+/).length;
          const chunkDuration = chunkWords / wordsPerSecond;
          
          segments.push({
            text: chunkText,
            wordCount: chunkWords,
            startTime: Number(currentForceTime.toFixed(2)),
            endTime: Number((currentForceTime + chunkDuration).toFixed(2))
          });
          currentForceTime += chunkDuration;
       }
    }

    return segments;
  }

  scoreSegment(segment, index, totalSegments) {
    let score = 0;
    const text = segment.text.toLowerCase();
    
    // 1. Keyword scoring (max 50 points)
    const importantMatches = this.importantKeywords.filter(kw => 
      text.includes(kw.toLowerCase())
    ).length;
    score += Math.min(importantMatches * 5, 50);
    
    // 2. Negative keyword penalty
    const negativeMatches = this.negativeKeywords.filter(kw => 
      text.includes(kw.toLowerCase())
    ).length;
    score -= negativeMatches * 10;
    
    // 3. Word count optimization (prefer 100-200 words, max 30 points)
    const wordCount = segment.wordCount;
    if (wordCount >= 100 && wordCount <= 200) {
      score += 30;
    } else if (wordCount >= 50 && wordCount <= 250) {
      score += 20;
    } else if (wordCount < 50) {
      score += 5;
    }
    
    // 4. Position heuristic (max 20 points)
    // Slightly prefer middle segments (avoid intro/outro)
    const position = index / totalSegments;
    if (position > 0.2 && position < 0.8) {
      score += 20;
    } else if (position > 0.1 && position < 0.9) {
      score += 10;
    }
    
    return Math.max(score, 0);
  }

  generateTitle(text) {
    // Extract first meaningful phrase (up to 50 chars)
    const words = text.split(/\s+/).slice(0, 8).join(' ');
    return words.length > 50 ? words.substring(0, 47) + '...' : words;
  }

  generateReason(segment) {
    const reasons = [];
    
    const text = segment.text.toLowerCase();
    const hasKeywords = this.importantKeywords.some(kw => 
      text.includes(kw.toLowerCase())
    );
    
    if (hasKeywords) {
      reasons.push('Contains important keywords');
    }
    
    if (segment.wordCount >= 100 && segment.wordCount <= 200) {
      reasons.push('Optimal length for short-form content');
    }
    
    if (segment.score > 60) {
      reasons.push('High engagement potential');
    }
    
    return reasons.length > 0 
      ? reasons.join('. ') + '.'
      : 'Selected based on content structure.';
  }
}

module.exports = { RuleBasedAnalyzer };
