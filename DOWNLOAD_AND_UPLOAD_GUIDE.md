# Download from Replit and Upload to GitHub Guide

## Step 1: Download Your Project from Replit

### Method 1: Download as ZIP (Recommended)
1. In your Replit project, click on the **three dots menu** (⋮) in the file explorer
2. Select **"Download as ZIP"**
3. Save the ZIP file to your computer
4. Extract the ZIP file to a folder (e.g., `iskcon-juhu-donation-system`)

### Method 2: Using Git Clone (if you have Git installed)
```bash
# On your local computer
git clone https://github.com/your-replit-username/your-repl-name.git
cd your-repl-name
```

## Step 2: Clean Up the Downloaded Project

After downloading, you need to clean up some files:

1. **Delete these files/folders** (they're not needed):
   ```
   .replit
   replit.nix
   node_modules/ (if present)
   .env (contains secrets)
   ```

2. **Keep these important files**:
   - All source code files (`client/`, `server/`, `shared/`)
   - `package.json` and `package-lock.json`
   - Configuration files (`tsconfig.json`, `vite.config.ts`, etc.)
   - Documentation files (`README.md`, guides, etc.)
   - `.gitignore` file

## Step 3: Prepare for GitHub Upload

### 3.1 Open Terminal/Command Prompt
- **Windows**: Press `Win + R`, type `cmd`, press Enter
- **Mac**: Press `Cmd + Space`, type `terminal`, press Enter
- **Linux**: Press `Ctrl + Alt + T`

### 3.2 Navigate to Your Project Folder
```bash
cd /path/to/your/extracted/project
# Example: cd C:\Users\YourName\Downloads\iskcon-juhu-donation-system
```

### 3.3 Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: ISKCON Juhu Donation System"
```

## Step 4: Create GitHub Repository

### 4.1 Go to GitHub
1. Open [GitHub.com](https://github.com) in your browser
2. Sign in to your GitHub account
3. Click the **"+" icon** in the top right corner
4. Select **"New repository"**

### 4.2 Repository Settings
- **Repository name**: `iskcon-juhu-donation-system`
- **Description**: `ISKCON Juhu Temple Donation Management System`
- **Visibility**: Choose Public or Private
- **Important**: Do NOT check "Initialize this repository with a README"
- Click **"Create repository"**

## Step 5: Push to GitHub

### 5.1 Connect Your Local Project to GitHub
```bash
# Replace 'yourusername' with your actual GitHub username
git remote add origin https://github.com/yourusername/iskcon-juhu-donation-system.git
git branch -M main
```

### 5.2 Push Your Code
```bash
git push -u origin main
```

**If you get an authentication error, you may need to:**
1. Use a personal access token instead of password
2. Or use GitHub Desktop application
3. Or use SSH keys (advanced)

## Step 6: Verify Upload

1. Go to your GitHub repository page
2. You should see all your project files
3. Check that the README.md displays properly
4. Verify important files are present

## Step 7: Deploy to VPS

Now that your code is on GitHub, you can deploy to your VPS:

### 7.1 Connect to Your VPS
```bash
ssh root@your-vps-ip
```

### 7.2 Run the Setup Script
```bash
# Download and run the automated setup
curl -O https://raw.githubusercontent.com/yourusername/iskcon-juhu-donation-system/main/vps-setup-script.sh
chmod +x vps-setup-script.sh
./vps-setup-script.sh
```

### 7.3 Clone and Deploy
```bash
# Navigate to web directory
cd /var/www/iskcon-juhu

# Clone your repository
git clone https://github.com/yourusername/iskcon-juhu-donation-system.git .

# Setup environment
cp .env.example .env
nano .env  # Add your production API keys

# Deploy
./deploy.sh

# Start application
pm2 start ecosystem.config.js
```

## Quick Checklist

### Before GitHub Upload:
- [ ] Project downloaded from Replit
- [ ] `.replit` and `replit.nix` files removed
- [ ] `.env` file removed (contains secrets)
- [ ] `node_modules/` folder removed
- [ ] Git repository initialized
- [ ] Files committed to git

### After GitHub Upload:
- [ ] Repository created on GitHub
- [ ] Code pushed successfully
- [ ] README.md displays correctly
- [ ] All source files present

### For VPS Deployment:
- [ ] VPS setup script executed
- [ ] Project cloned from GitHub
- [ ] Environment variables configured
- [ ] Application deployed and running
- [ ] Website accessible via domain

## Troubleshooting

### Common Issues:

1. **Git not installed**:
   - Download from [git-scm.com](https://git-scm.com/)
   - Or use GitHub Desktop

2. **Authentication failed**:
   - Use Personal Access Token instead of password
   - Go to GitHub Settings → Developer settings → Personal access tokens

3. **Large files error**:
   - Remove `node_modules/` and `uploads/` folders
   - These will be recreated on the server

4. **Permission denied**:
   - Make sure you're the owner of the GitHub repository
   - Check your GitHub username in the commands

## Files to Exclude from GitHub

Your `.gitignore` file already handles this, but make sure these are NOT uploaded:
- `.env` (contains API keys)
- `node_modules/`
- `uploads/` (user-uploaded files)
- `.replit` and `replit.nix`
- Log files (`*.log`)

## Next Steps

After successful GitHub upload and VPS deployment:
1. Test your website functionality
2. Configure your domain name
3. Set up SSL certificates
4. Test payment processing
5. Configure backups

Your ISKCON Juhu Donation System will be live and ready for use!