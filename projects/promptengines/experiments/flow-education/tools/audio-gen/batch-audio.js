#!/usr/bin/env node
/**
 * Batch Audio Generator for Flow Education
 * 
 * Usage: node batch-audio.js --lesson quest-001-letter-a --manifest ./manifest.json
 * 
 * Generates narration and audio using TTS API (ElevenLabs, Amazon Polly, or Google)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const CONFIG_PATH = path.join(__dirname, '..', '..', 'config.json');
const OUTPUT_BASE = path.join(__dirname, '..', '..', 'assets', 'audio');

/**
 * Load configuration
 */
function loadConfig() {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    return config.audio_api || {};
  } catch (e) {
    console.error('❌ Error loading config:', e.message);
    process.exit(1);
  }
}

/**
 * Generate audio using ElevenLabs API
 */
async function generateElevenLabs(text, outputPath, apiConfig) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      text: text,
      model_id: apiConfig.model || 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    });

    const options = {
      hostname: 'api.elevenlabs.io',
      port: 443,
      path: `/v1/text-to-speech/${apiConfig.voice_id}`,
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiConfig.api_key,
        'Content-Length': payload.length
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        fs.writeFileSync(outputPath, buffer);
        resolve(outputPath);
      });
    });

    req.on('error', (e) => reject(e));
    req.write(payload);
    req.end();
  });
}

/**
 * Generate audio using Amazon Polly
 */
async function generatePolly(text, outputPath, apiConfig) {
  // AWS SDK would be used here - placeholder for now
  console.log('Amazon Polly generation would use AWS SDK');
  console.log('For MVP, ElevenLabs is recommended (better quality for tutoring)');
  throw new Error('Polly not yet implemented');
}

/**
 * Process batch audio generation
 */
async function processBatch(manifestPath, lessonId) {
  console.log(`🎙️  Batch Audio Generator`);
  console.log(`📦 Lesson: ${lessonId}`);
  console.log('');

  const apiConfig = loadConfig();
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Create output directories
  const lessonOutputDir = path.join(OUTPUT_BASE, lessonId);
  const categories = ['narration', 'feedback', 'sfx'];
  
  categories.forEach(cat => {
    const dir = path.join(lessonOutputDir, cat);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const results = { success: [], failed: [] };

  // Generate narration
  if (manifest.assets?.audio?.narration) {
    console.log('\n🎯 Generating narration...');
    for (const item of manifest.assets.audio.narration) {
      const outputPath = path.join(lessonOutputDir, 'narration', `${item.id}.mp3`);
      
      if (fs.existsSync(outputPath) && !process.argv.includes('--force')) {
        console.log(`  ⏭️  Skipped: ${item.id}`);
        results.success.push({ id: item.id, skipped: true });
        continue;
      }

      console.log(`  🎵 ${item.id}: "${item.text.substring(0, 40)}..."`);
      
      try {
        if (apiConfig.provider === 'elevenlabs') {
          await generateElevenLabs(item.text, outputPath, apiConfig);
        } else {
          await generatePolly(item.text, outputPath, apiConfig);
        }
        console.log(`  ✅ Saved: ${outputPath}`);
        results.success.push({ id: item.id, path: outputPath });
        await new Promise(r => setTimeout(r, 500)); // Rate limiting
      } catch (error) {
        console.error(`  ❌ Failed: ${item.id} - ${error.message}`);
        results.failed.push({ id: item.id, error: error.message });
      }
    }
  }

  // Generate feedback variations
  if (manifest.assets?.audio?.feedback) {
    console.log('\n🎯 Generating feedback audio...');
    for (const item of manifest.assets.audio.feedback) {
      const outputPath = path.join(lessonOutputDir, 'feedback', `${item.id}.mp3`);
      
      if (fs.existsSync(outputPath) && !process.argv.includes('--force')) {
        results.success.push({ id: item.id, skipped: true });
        continue;
      }

      try {
        if (apiConfig.provider === 'elevenlabs') {
          await generateElevenLabs(item.text, outputPath, apiConfig);
        }
        results.success.push({ id: item.id, path: outputPath });
        await new Promise(r => setTimeout(r, 500));
      } catch (error) {
        results.failed.push({ id: item.id, error: error.message });
      }
    }
  }

  // Save report
  const reportPath = path.join(lessonOutputDir, 'audio-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    lesson_id: lessonId,
    generated_at: new Date().toISOString(),
    provider: apiConfig.provider,
    total: results.success.length + results.failed.length,
    success: results.success.length,
    failed: results.failed.length,
    results: results
  }, null, 2));

  console.log('\n📊 Audio Report');
  console.log(`   ✅ Success: ${results.success.length}`);
  console.log(`   ❌ Failed: ${results.failed.length}`);
}

// CLI
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i].startsWith('--')) {
    const key = process.argv[i].replace('--', '');
    args[key] = process.argv[i + 1] || true;
    if (args[key] !== true) i++;
  }
}

if (!args.lesson) {
  console.log(`
🎙️  Flow Education — Batch Audio Generator

Usage:
  node batch-audio.js --lesson quest-001-letter-a

Options:
  --lesson     Lesson ID
  --manifest   Path to manifest (optional, auto-detected)
  --force      Regenerate existing files
`);
  process.exit(0);
}

const manifestPath = args.manifest || path.join(
  __dirname, '..', '..', 'lessons', args.lesson, 'assets-manifest.json'
);

processBatch(manifestPath, args.lesson).catch(console.error);
