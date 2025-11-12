#!/bin/bash

# Push ISKCON Juhu Website to GitHub
# Repository: https://github.com/Saty-27/IskconJuhuWebsite.git

echo "🚀 Preparing to push ISKCON Juhu Website to GitHub..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
fi

# Add your GitHub repository as remote
echo "Adding GitHub repository as remote..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/Saty-27/IskconJuhuWebsite.git

# Add all files
echo "Adding all files..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "ISKCON Juhu Donation System - Complete implementation with admin panel, PayU integration, and VPS deployment ready"

# Push to GitHub
echo "Pushing to GitHub..."
git branch -M main
git push -u origin main --force

echo "✅ Code successfully pushed to GitHub!"
echo "📁 Repository: https://github.com/Saty-27/IskconJuhuWebsite.git"
echo ""
echo "Next steps:"
echo "1. Visit your GitHub repository to verify the upload"
echo "2. Use the VPS deployment guide to deploy to your server"
echo "3. Run the automated setup script on your VPS"