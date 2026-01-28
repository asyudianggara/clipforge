const youtubedl = require('youtube-dl-exec');

const testUrl = 'https://youtu.be/wE8cj2XdAic';

console.log('Testing YouTube Download...');
console.log('URL:', testUrl);

youtubedl(testUrl, {
  dumpSingleJson: true,
  noCheckCertificates: true,
  noWarnings: true,
})
  .then(output => {
    console.log('Video Info Retrieved Successfully!');
    console.log('Title:', output.title);
    console.log('Duration:', output.duration, 'seconds');
    console.log('Format:', output.format);
  })
  .catch(err => {
    console.error('FAILED:', err.message);
    console.error('Full Error:', err);
  });
