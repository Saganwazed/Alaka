const https = require('https');
const fs = require('fs');
const path = require('path');
const tar = require('tar');

const OLLAMA_VERSION = '0.1.29'; // The version of Ollama to download
const OLLAMA_URL = `https://github.com/jmorganca/ollama/releases/download/v${OLLAMA_VERSION}/ollama-linux-amd64`;
const OLLAMA_DIR = path.join(__dirname);
const OLLAMA_PATH = path.join(OLLAMA_DIR, 'ollama');

async function downloadOllama() {
  if (fs.existsSync(OLLAMA_PATH)) {
    console.log('Ollama binary already exists, skipping download.');
    return;
  }

  console.log(`Downloading Ollama v${OLLAMA_VERSION}...`);

  const file = fs.createWriteStream(OLLAMA_PATH);
  await new Promise((resolve, reject) => {
    https.get(OLLAMA_URL, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('Ollama downloaded successfully.');
        fs.chmodSync(OLLAMA_PATH, '755'); // Make the binary executable
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(OLLAMA_PATH);
      reject(err.message);
    });
  });
}

module.exports = downloadOllama;
