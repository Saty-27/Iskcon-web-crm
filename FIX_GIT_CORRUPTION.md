# Fix Git Repository Corruption Error

## The Problem
Git repository corruption occurred during push. The error "did not receive expected object" indicates corrupted Git objects.

## Solution: Clean and Rebuild Repository

### Step 1: Clean Git Repository
```bash
# Remove corrupted git repository
rm -rf .git

# Initialize fresh git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: ISKCON Juhu Donation System"
```

### Step 2: Add Remote and Push
```bash
# Add GitHub remote
git remote add origin https://github.com/Saty-27/IskconJuhuWebsite.git

# Create main branch and push
git branch -M main
git push -u origin main --force
```

### Step 3: Alternative - Use Smaller Commits
If the repository is still too large, split the push:

```bash
# Add files in smaller batches
git add package.json package-lock.json tsconfig.json
git commit -m "Add configuration files"
git push origin main

# Add source code
git add client/ server/ shared/
git commit -m "Add source code"
git push origin main

# Add documentation
git add *.md
git commit -m "Add documentation"
git push origin main

# Add remaining files
git add .
git commit -m "Add remaining files"
git push origin main
```

## Quick Fix Commands

Run these in Replit Shell:

```bash
# Clean rebuild
rm -rf .git
git init
git add .
git commit -m "ISKCON Juhu Donation System - Clean rebuild"
git remote add origin https://github.com/Saty-27/IskconJuhuWebsite.git
git branch -M main
git push -u origin main --force
```

## Why This Happens
- Large file uploads can cause Git corruption
- Network interruptions during push
- Repository size limits

## Prevention
- Use .gitignore to exclude large files
- Make smaller, incremental commits
- Exclude uploads/ and node_modules/ directories