/**
 * lesson-assembler/package.js
 * 
 * Compiles generated assets into deployable lesson packages
 * for the Flow Education Android app.
 * 
 * Usage:
 *   node lesson-assembler/package.js --lesson quest-001-letter-a
 *   node lesson-assembler/package.js --lesson quest-001-letter-a --include-manifest
 *   node lesson-assembler/package.js --all
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Configuration
const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const LESSONS_DIR = path.join(__dirname, '..', 'lessons');
const OUTPUT_DIR = path.join(__dirname, '..', 'output');

// CLI arguments
const args = process.argv.slice(2);
const lessonId = args.find(arg => arg.startsWith('--lesson='))?.split('=')[1];
const includeManifest = args.includes('--include-manifest');
const packageAll = args.includes('--all');
const verbose = args.includes('--verbose');

/**
 * Validates that all required assets exist for a lesson
 */
async function validateAssets(lessonId, manifest) {
  const errors = [];
  const required = [];
  
  // Check all image assets
  if (manifest.images) {
    for (const [category, items] of Object.entries(manifest.images)) {
      for (const item of items) {
        const expectedPath = path.join(ASSETS_DIR, 'images', lessonId, category, `${item.id}.png`);
        required.push({ type: 'image', id: item.id, path: expectedPath });
        
        try {
          await fs.access(expectedPath);
        } catch {
          errors.push(`Missing image: ${category}/${item.id}.png`);
        }
      }
    }
  }
  
  // Check all audio assets
  if (manifest.audio) {
    for (const [category, items] of Object.entries(manifest.audio)) {
      for (const item of items) {
        const expectedPath = path.join(ASSETS_DIR, 'audio', lessonId, category, `${item.id}.mp3`);
        required.push({ type: 'audio', id: item.id, path: expectedPath });
        
        try {
          await fs.access(expectedPath);
        } catch {
          errors.push(`Missing audio: ${category}/${item.id}.mp3`);
        }
      }
    }
  }
  
  return { valid: errors.length === 0, errors, required };
}

/**
 * Generates checksums for all assets
 */
async function generateChecksums(files) {
  const checksums = {};
  
  for (const file of files) {
    try {
      const data = await fs.readFile(file.path);
      checksums[file.id] = crypto.createHash('sha256').update(data).digest('hex').slice(0, 16);
    } catch (err) {
      checksums[file.id] = 'ERROR';
    }
  }
  
  return checksums;
}

/**
 * Calculates total package size
 */
async function calculateSize(files) {
  let totalBytes = 0;
  
  for (const file of files) {
    try {
      const stats = await fs.stat(file.path);
      totalBytes += stats.size;
    } catch {
      // Skip missing files
    }
  }
  
  return {
    bytes: totalBytes,
    mb: (totalBytes / 1024 / 1024).toFixed(2)
  };
}

/**
 * Packages a single lesson
 */
async function packageLesson(lessonId) {
  console.log(`\n📦 Packaging ${lessonId}...\n`);
  
  // Load manifest
  const manifestPath = path.join(LESSONS_DIR, lessonId, 'assets-manifest.json');
  let manifest;
  
  try {
    const manifestData = await fs.readFile(manifestPath, 'utf8');
    manifest = JSON.parse(manifestData);
  } catch (err) {
    console.error(`✗ Failed to load manifest for ${lessonId}:`, err.message);
    return { success: false, error: 'manifest_load_failed' };
  }
  
  // Validate assets
  const validation = await validateAssets(lessonId, manifest);
  
  if (!validation.valid) {
    console.error('✗ Asset validation failed:');
    for (const error of validation.errors) {
      console.error(`  - ${error}`);
    }
    console.error(`\nRun generators first:`);
    console.error(`  node tools/image-gen/batch-generate.js --lesson ${lessonId}`);
    console.error(`  node tools/audio-gen/batch-audio.js --lesson ${lessonId}`);
    return { success: false, error: 'missing_assets', missing: validation.errors };
  }
  
  console.log(`✓ All ${validation.required.length} assets validated`);
  
  // Create output directory
  const outputLessonDir = path.join(OUTPUT_DIR, lessonId);
  await fs.mkdir(outputLessonDir, { recursive: true });
  
  // Copy assets to output
  const copied = { images: 0, audio: 0 };
  
  for (const file of validation.required) {
    const destDir = path.join(outputLessonDir, file.type === 'image' ? 'images' : 'audio');
    await fs.mkdir(destDir, { recursive: true });
    
    const destPath = path.join(destDir, path.basename(file.path));
    await fs.copyFile(file.path, destPath);
    copied[file.type === 'image' ? 'images' : 'audio']++;
  }
  
  console.log(`✓ Copied ${copied.images} images, ${copied.audio} audio files`);
  
  // Generate checksums
  const checksums = await generateChecksums(validation.required);
  console.log(`✓ Generated ${Object.keys(checksums).length} checksums`);
  
  // Calculate size
  const size = await calculateSize(validation.required);
  console.log(`✓ Package size: ${size.mb} MB`);
  
  // Generate manifest
  const outputManifest = {
    lessonId,
    title: manifest.title || lessonId,
    version: '1.0.0',
    packagedAt: new Date().toISOString(),
    stats: {
      images: copied.images,
      audio: copied.audio,
      totalAssets: validation.required.length,
      sizeMb: parseFloat(size.mb)
    },
    checksums,
    assets: manifest
  };
  
  // Write manifest
  if (includeManifest) {
    const manifestOutputPath = path.join(outputLessonDir, 'manifest.json');
    await fs.writeFile(manifestOutputPath, JSON.stringify(outputManifest, null, 2));
    console.log(`✓ Written manifest.json`);
  }
  
  // Generate report
  const report = {
    lessonId,
    success: true,
    timestamp: new Date().toISOString(),
    stats: outputManifest.stats,
    outputPath: outputLessonDir
  };
  
  // Write report
  const reportPath = path.join(OUTPUT_DIR, `${lessonId}-package-report.json`);
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`\n✓ ${lessonId} packaged successfully!`);
  console.log(`  Output: ${outputLessonDir}`);
  console.log(`  Report: ${reportPath}`);
  
  return report;
}

/**
 * Packages all available lessons
 */
async function packageAllLessons() {
  const lessonDirs = await fs.readdir(LESSONS_DIR);
  const results = [];
  
  for (const dir of lessonDirs) {
    const manifestPath = path.join(LESSONS_DIR, dir, 'assets-manifest.json');
    try {
      await fs.access(manifestPath);
      const result = await packageLesson(dir);
      results.push(result);
    } catch {
      if (verbose) {
        console.log(`Skipping ${dir} (no manifest)`);
      }
    }
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  
  console.log(`\n📊 Packaging Summary`);
  console.log(`  Total: ${results.length}`);
  console.log(`  Successful: ${successful}`);
  console.log(`  Failed: ${failed}`);
  
  if (failed > 0) {
    console.log(`\nFailed lessons:`);
    for (const result of results.filter(r => !r.success)) {
      console.log(`  - ${result.lessonId}: ${result.error}`);
    }
  }
  
  return results;
}

/**
 * Main entry point
 */
async function main() {
  console.log('🎓 Flow Education — Lesson Assembler\n');
  
  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  
  if (packageAll) {
    await packageAllLessons();
  } else if (lessonId) {
    const result = await packageLesson(lessonId);
    process.exit(result.success ? 0 : 1);
  } else {
    console.log('Usage:');
    console.log('  node lesson-assembler/package.js --lesson=quest-001-letter-a');
    console.log('  node lesson-assembler/package.js --lesson=quest-001-letter-a --include-manifest');
    console.log('  node lesson-assembler/package.js --all');
    console.log('  node lesson-assembler/package.js --lesson=quest-001-letter-a --verbose');
    process.exit(1);
  }
}

// Error handling
process.on('unhandledRejection', (err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});

main();
