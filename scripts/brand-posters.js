const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Configuration
const LOGO_PATH = './logo.png'; // Your BuildMitra logo
const INPUT_DIR = './input-images'; // Where your images are
const OUTPUT_DIR = './output-posters'; // Where branded posters go
const LOGO_WIDTH = 200; // Logo width in pixels
const LOGO_HEIGHT = 80; // Logo height in pixels
const TITLE_FONT_SIZE = 24;

// Poster titles (map image filename to title)
const POSTER_TITLES = {
  'slab-concrete-checklist.png': 'Slab Concrete Pouring Checklist',
  'unit-weight-materials.png': 'Engineering Material Unit Weight',
  'classification-concrete.png': 'Classification of Grade of Concrete',
  'standard-room-sizes.png': 'Standard Room Sizes in Residential Buildings',
  'type-of-loads.png': 'Type of Load on Building Structure',
  'thumb-rule-construction.png': 'Civil Engineering Thumb Rules',
  'basic-knowledge-civil.png': 'Basic Knowledge for Civil Engineers',
  'road-cost-estimation.png': 'Road Cost Estimation - Complete',
  // Add more as needed
};

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Process each image
async function processImage(filename) {
  const inputPath = path.join(INPUT_DIR, filename);
  const outputPath = path.join(OUTPUT_DIR, `branded-${filename}`);
  
  try {
    // Get original image dimensions
    const metadata = await sharp(inputPath).metadata();
    const width = metadata.width;
    const height = metadata.height;
    
    // Add padding at top for logo and title
    const topPadding = 140;
    
    // Create white background with padding
    const background = await sharp({
      create: {
        width: width,
        height: height + topPadding,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    }).png().toBuffer();
    
    // Composite logo + title + original image
    const result = await sharp(background)
      .composite([
        {
          input: LOGO_PATH,
          top: 20,
          left: 20,
          width: LOGO_WIDTH,
          height: LOGO_HEIGHT,
        },
        {
          input: Buffer.from(`
            <svg width="${width}" height="${topPadding - 40}">
              <text x="${width/2}" y="60" font-family="Arial" font-size="${TITLE_FONT_SIZE}" font-weight="bold" fill="#1a1a2e" text-anchor="middle">${POSTER_TITLES[filename] || 'BuildMitra Civil Engineering'}</text>
              <line x1="20" y1="80" x2="${width-20}" y2="80" stroke="#ff7a00" stroke-width="3"/>
              <text x="${width/2}" y="100" font-family="Arial" font-size="14" fill="#ff7a00" text-anchor="middle">BuildMitra Professional Series</text>
            </svg>
          `),
          top: 0,
          left: 0,
        },
        {
          input: inputPath,
          top: topPadding,
          left: 0,
        }
      ])
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Processed: ${filename}`);
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
  }
}

// Process all images in input directory
async function processAll() {
  const files = fs.readdirSync(INPUT_DIR).filter(file => 
    file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')
  );
  
  console.log(`Found ${files.length} images to process`);
  
  for (const file of files) {
    await processImage(file);
  }
  
  console.log('✅ All images processed!');
}

// Run
processAll();