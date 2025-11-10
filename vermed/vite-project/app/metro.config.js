const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for TypeScript and other file extensions
config.resolver.assetExts.push(
  // Images
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.svg',
  // Fonts
  '.ttf',
  '.otf',
  // Audio
  '.mp3',
  '.wav',
  '.m4a'
);

module.exports = config;