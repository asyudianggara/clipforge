const youtubedl = require('youtube-dl-exec');
const path = require('path');

const testUrl = 'https://youtu.be/xEah8NzNrGQ';

async function test() {
  console.log('Testing download with improved flags...');
  try {
    const result = await youtubedl(testUrl, {
      dumpJson: true,
      noCheckCertificates: true,
      noPlaylist: true,
      // User agent helps bypass simple blocks
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      // This is a known effective workaround for YouTube blocks
      extractorArgs: 'youtube:player_client=android,web'
    });
    console.log('Success! Video Title:', result.title);
  } catch (error) {
    console.error('Download Test Failed:');
    console.error(error.message);
  }
}

test();
