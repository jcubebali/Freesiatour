const https = require('https');
https.get('https://logo.clearbit.com/tripadvisor.com', (res) => {
  console.log('clearbit status:', res.statusCode);
});
