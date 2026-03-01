#!/usr/bin/env node
/**
 * Batch Image Generator for Flow Education
 * 
 * Usage: node batch-generate.js --lesson quest-001-letter-a --manifest ./manifest.json
 * 
 * Generates consistent cartoon illustrations using Fireworks AI API
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const CONFIG_PATH = path.join(__dirname, '..', '..', 'config.json');
const OUTPUT_BASE = path.join(__dirname, '..', '..', 'assets', 'images');

// Default image generation parameters
const DEFAULT_PARAMS = {
  width: 1024,
  height: 1024,
  steps: 30,
  cfg_scale: 7.5,
  style_preset: 'digital-art'
};

// Style template for consistent look
const STYLE_TEMPLATE = `2D cartoon illustration for children, friendly and warm, simple shapes, 
bold outlines, flat colors, no gradients, educational style, 
suitable for kindergarten, high contrast, cheerful, isolated on transparent background`;

/**
 * Load configuration from config.json
 */
function loadConfig() {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    return config.image_api || {};
  } catch (e) {
    console.error('❌ Error loading config:', e.message);
    console.log('Create tools/config.json with your API keys');
    process.exit(1);
  }
}

/**
 * Generate image using Fireworks AI API
 */
async function generateImage(prompt, outputPath, apiConfig) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      prompt: prompt,
      ...DEFAULT_PARAMS,
      ...(apiConfig.default_params || {})
    });

    const options = {
      hostname: 'api.fireworks.ai',
      port: 443,
      path: `/inference/v1/image/generation/${apiConfig.model || 'stable-diffusion-xl-1024-v1-0'}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.api_key}`,
        'Content-Length': payload.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.image) {
            // Save base64 image
            const buffer = Buffer.from(response.image, 'base64');
            fs.writeFileSync(outputPath, buffer);
            resolve(outputPath);
          } else {
            reject(new Error(`API Error: ${response.message || 'Unknown error'}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(payload);
    req.end();
  });
}

/**
 * Process batch generation from manifest
 */
async function processBatch(manifestPath, lessonId) {
  console.log(`🎨 Batch Image Generator`);
  console.log(`📦 Lesson: ${lessonId}`);
  console.log(`📄 Manifest: ${manifestPath}`);
  console.log('');

  // Load config and manifest
  const apiConfig = loadConfig();
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  // Create output directories
  const lessonOutputDir = path.join(OUTPUT_BASE, lessonId);
  const categories = ['characters', 'objects', 'letters', 'backgrounds', 'ui'];
  
  categories.forEach(cat => {
    const dir = path.join(lessonOutputDir, cat);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created: ${dir}`);
    }
  });

  // Process each asset category
  const results = {
    success: [],
    failed: []
  };

  for (const [category, items] of Object.entries(manifest.assets?.images || {})) {
    console.log(`\n🎯 Processing category: ${category}`);
    
    for (const item of items) {
      const outputPath = path.join(lessonOutputDir, category, `${item.id}.png`);
      
      // Skip if already exists (unless --force flag)
      if (fs.existsSync(outputPath) && !process.argv.includes('--force')) {
        console.log(`  ⏭️  Skipped (exists): ${item.id}`);
        results.success.push({ id: item.id, path: outputPath, skipped: true });
        continue;
      }

      // Build full prompt with style template
      const fullPrompt = `${item.prompt}, ${STYLE_TEMPLATE}`;
      
      console.log(`  🖼️  Generating: ${item.id}`);
      console.log(`     Prompt: ${item.prompt.substring(0, 60)}...`);
      
      try {
        await generateImage(fullPrompt, outputPath, apiConfig);
        console.log(`  ✅ Saved: ${outputPath}`);
        results.success.push({ id: item.id, path: outputPath });
        
        // Rate limiting - be nice to the API
        await new Promise(r => setTimeout(r, 1000));
      } catch (error) {
        console.error(`  ❌ Failed: ${item.id} - ${error.message}`);
        results.failed.push({ id: item.id, error: error.message });
      }
    }
  }

  // Save generation report
  const reportPath = path.join(lessonOutputDir, 'generation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    lesson_id: lessonId,
    generated_at: new Date().toISOString(),
    total: results.success.length + results.failed.length,
    success: results.success.length,
    failed: results.failed.length,
    results: results
  }, null, 2));

  console.log('\n📊 Generation Report');
  console.log(`   Total: ${results.success.length + results.failed.length}`);
  console.log(`   ✅ Success: ${results.success.length}`);
  console.log(`   ❌ Failed: ${results.failed.length}`);
  console.log(`   📄 Report: ${reportPath}`);
}

/**
 * CLI argument parsing
 */
function parseArgs() {
  const args = {};
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i].startsWith('--')) {
      const key = process.argv[i].replace('--', '');
      args[key] = process.argv[i + 1] || true;
      if (args[key] !== true) i++;
    }
  }
  return args;
}

// Main execution
const args = parseArgs();

if (!args.lesson) {
  console.log(`
🎨 Flow Education — Batch Image Generator

Usage:
  node batch-generate.js --lesson quest-001-letter-a --manifest ./manifest.json

Options:
  --lesson     Lesson ID (e.g., quest-001-letter-a)
  --manifest   Path to asset manifest JSON
  --force      Regenerate even if files exist
  
Example:
  node batch-generate.js --lesson quest-001-letter-a \
    --manifest ../../lessons/quest-001-letter-a/assets-manifest.json
`);
  process.exit(0);
}

const manifestPath = args.manifest || path.join(
  __dirname, '..', '..', 'lessons', args.lesson, 'assets-manifest.json'
);

if (!fs.existsSync(manifestPath)) {
  console.error(`❌ Manifest not found: ${manifestPath}`);
  console.log('Create the manifest file first or provide correct path');
  process.exit(1);
}

processBatch(manifestPath, args.lesson).catch(console.error);
