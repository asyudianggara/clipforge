const fs = require('fs-extra');
const path = require('path');

/**
 * subtitleGenerator.js
 * Membantu pembuatan hardcoded subtitles untuk video klip.
 */

const generateASS = (text, startOffset, duration, outputPath) => {
  const words = text.trim().split(/\s+/);
  const wordsPerGroup = 5; 
  const groups = [];
  
  for (let i = 0; i < words.length; i += wordsPerGroup) {
    groups.push(words.slice(i, i + wordsPerGroup).join(' '));
  }

  const durationPerGroup = duration / groups.length;
  
  // ASS Header with Styles
  let assContent = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
// Viral Style: Tahoma/Impact/Arial Black, Large (30-40), Yellow Text (&H0000FFFF in ASS BGR), Thick Black Outline
Style: Default,Arial Black,30,&H0000FFFF,&H000000,&H000000,&H000000,-1,0,0,0,100,100,0,0,1,3,0,2,10,10,60,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  groups.forEach((group, index) => {
    const start = index * durationPerGroup;
    const end = (index + 1) * durationPerGroup;

    assContent += `Dialogue: 0,${formatTimeASS(start)},${formatTimeASS(end)},Default,,0,0,0,,${group}\n`;
  });

  fs.writeFileSync(outputPath, assContent);
  return outputPath;
};

const formatTimeASS = (seconds) => {
  const date = new Date(0);
  date.setSeconds(seconds);
  const ms = Math.floor((seconds % 1) * 100); // ASS uses centiseconds (2 digits)
  const timePart = date.toISOString().substr(11, 8); // HH:MM:SS
  return `${timePart}.${ms.toString().padStart(2, '0')}`;
};

module.exports = { generateSRT: generateASS }; // Export as generateSRT for compatibility but strictly it's ASS now
