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
      
      // Emotional keywords
      'menarik', 'luar biasa', 'amazing', 'incredible', 'wow',
      'shocking', 'mengejutkan', 'unik', 'hebat',
      
      // Educational keywords
      'belajar', 'understand', 'pahami', 'kenapa', 'mengapa',
      'bagaimana', 'tutorial', 'penjelasan', 'alasan',
      
      // Action keywords
      'harus', 'wajib', 'jangan', 'perlu', 'penting untuk',
      'sebaiknya', 'recommended', 'avoid', 'hindari'
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
   * @returns {Promise<Array>} Array of segment recommendations
   */
  async analyzeContent(transcript, videoDuration = 0) {
    console.log('Using Rule-Based Analyzer (Free Mode)...');
    
    // Split transcript into sentences
    const sentences = this.splitIntoSentences(transcript);
    
    // Group sentences into potential segments (30-60 seconds each)
    const segments = this.groupIntoSegments(sentences);
    
    // Score each segment
    const scoredSegments = segments.map((segment, index) => ({
      ...segment,
      score: this.scoreSegment(segment, index, segments.length),
      index
    }));
    
    // Sort by score and take top 3-5
    const topSegments = scoredSegments
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
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

  groupIntoSegments(sentences) {
    const segments = [];
    const wordsPerSecond = 2.5; // Average speaking rate
    let currentSegment = {
      text: '',
      wordCount: 0,
      startTime: 0,
      endTime: 0
    };
    
    let currentTime = 0;
    
    sentences.forEach(sentence => {
      const words = sentence.split(/\s+/).length;
      const duration = words / wordsPerSecond;
      
      // If adding this sentence exceeds 60 seconds, start new segment
      if (currentSegment.wordCount > 0 && 
          (currentTime - currentSegment.startTime) + duration > 60) {
        segments.push({ ...currentSegment });
        currentSegment = {
          text: sentence,
          wordCount: words,
          startTime: currentTime,
          endTime: currentTime + duration
        };
      } else {
        currentSegment.text += (currentSegment.text ? ' ' : '') + sentence;
        currentSegment.wordCount += words;
        currentSegment.endTime = currentTime + duration;
      }
      
      currentTime += duration;
    });
    
    // Add last segment
    if (currentSegment.wordCount > 0) {
      segments.push(currentSegment);
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
