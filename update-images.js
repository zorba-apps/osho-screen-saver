#!/usr/bin/env node

/**
 * Simple script to update Osho image IDs in the configuration
 * Usage: node update-images.js "image1,image2,image3"
 * Or: node update-images.js (interactive mode)
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const imagesFile = path.join(__dirname, 'app', 'lib', 'images.json');

function updateImages(imageIds) {
  try {
    // Read current config
    const config = JSON.parse(fs.readFileSync(imagesFile, 'utf8'));
    
    // Update image list
    config.oshoImages = imageIds.split(',').map(id => id.trim()).filter(id => id);
    
    // Write back to file
    fs.writeFileSync(imagesFile, JSON.stringify(config, null, 2));
    
    console.log(`✅ Updated ${config.oshoImages.length} images in ${imagesFile}`);
    console.log('📝 Images:', config.oshoImages.join(', '));
    
  } catch (error) {
    console.error('❌ Error updating images:', error.message);
    process.exit(1);
  }
}

function interactiveMode() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('🎨 Osho Screen Saver - Image Updater');
  console.log('=====================================');
  console.log('Enter your Cloudinary image public IDs (comma-separated):');
  console.log('Example: Osho_1_abc123,Osho_2_def456,Osho_3_ghi789');
  console.log('');
  
  rl.question('Image IDs: ', (input) => {
    if (input.trim()) {
      updateImages(input);
    } else {
      console.log('❌ No images provided');
    }
    rl.close();
  });
}

// Main execution
const args = process.argv.slice(2);

if (args.length > 0) {
  // Command line mode
  updateImages(args[0]);
} else {
  // Interactive mode
  interactiveMode();
}
