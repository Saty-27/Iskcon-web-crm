# Push Code to Your GitHub Repository

## Your GitHub Repository
**Repository URL**: https://github.com/Saty-27/IskconJuhuWebsite.git

## Method 1: Using Replit's Git Integration (Recommended)

### Step 1: In Replit Shell
1. Open the **Shell** tab in Replit
2. Run these commands:

```bash
# Initialize git (if not already done)
git init

# Add your GitHub repository as remote
git remote add origin https://github.com/Saty-27/IskconJuhuWebsite.git

# Add all files
git add .

# Commit with a message
git commit -m "ISKCON Juhu Donation System - Complete implementation"

# Push to GitHub
git branch -M main
git push -u origin main --force
```

### Step 2: Authentication
When prompted for credentials, use:
- **Username**: Your GitHub username
- **Password**: Your GitHub Personal Access Token (not your regular password)

## Method 2: Download and Push Manually

### Step 1: Download Project
1. In Replit, click the **three dots menu** (⋮) in the file explorer
2. Select **"Download as ZIP"**
3. Extract the ZIP file on your computer

### Step 2: Push to GitHub
Open terminal/command prompt and run:
```bash
# Navigate to extracted folder
cd path/to/extracted/folder

# Initialize git
git init

# Add remote
git remote add origin https://github.com/Saty-27/IskconJuhuWebsite.git

# Add files
git add .

# Commit
git commit -m "ISKCON Juhu Donation System - Complete implementation"

# Push
git branch -M main
git push -u origin main --force
```

## Getting GitHub Personal Access Token

If you don't have a Personal Access Token:

1. Go to GitHub.com → Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Select these scopes:
   - `repo` (full control of private repositories)
   - `workflow` (update GitHub Action workflows)
4. Copy the token and use it as your password

## After Successful Push

Once the code is pushed to GitHub, you can deploy to your VPS:

### Step 1: Connect to VPS
```bash
ssh root@your-vps-ip
```

### Step 2: Run Setup Script
```bash
curl -O https://raw.githubusercontent.com/Saty-27/IskconJuhuWebsite/main/vps-setup-script.sh
chmod +x vps-setup-script.sh
./vps-setup-script.sh
```

### Step 3: Deploy Application
```bash
cd /var/www/iskcon-juhu
git clone https://github.com/Saty-27/IskconJuhuWebsite.git .
cp .env.example .env
nano .env  # Add your production API keys
./deploy.sh
pm2 start ecosystem.config.js
```

## Important Files Already Prepared

Your project now includes:
- ✅ `.gitignore` - Excludes sensitive files
- ✅ `README.md` - Project documentation
- ✅ `vps-setup-script.sh` - Automated VPS setup
- ✅ `GITHUB_TO_VPS_DEPLOYMENT.md` - Complete deployment guide
- ✅ All deployment guides and scripts

## What Gets Uploaded to GitHub

✅ **Included**:
- All source code (`client/`, `server/`, `shared/`)
- Configuration files (`package.json`, `tsconfig.json`, etc.)
- Documentation and deployment guides
- Setup scripts

❌ **Excluded** (for security):
- `.env` file (contains API keys)
- `node_modules/` folder
- Upload files (`uploads/`)
- Log files

## Next Steps After GitHub Upload

1. **Verify Upload**: Check https://github.com/Saty-27/IskconJuhuWebsite
2. **Deploy to VPS**: Follow the deployment guide
3. **Configure Environment**: Add your API keys in production `.env`
4. **Test Website**: Verify all functionality works
5. **Go Live**: Point your domain to the VPS

Your ISKCON Juhu Donation System is ready for deployment!