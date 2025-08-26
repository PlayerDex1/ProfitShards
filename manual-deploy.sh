#!/bin/bash

echo "🚀 Manual Deploy Debug Script"
echo "============================="

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building project..."
npm run build

echo "📁 Checking build output..."
ls -la dist/
ls -la dist/public/

echo "📊 Build size analysis..."
du -sh dist/public/*

echo "✅ Build completed successfully!"
echo "Files ready for deployment in: dist/public/"

echo "🌐 Deploy info:"
echo "- Branch: $(git branch --show-current)"
echo "- Last commit: $(git log --oneline -1)"
echo "- Build timestamp: $(date)"