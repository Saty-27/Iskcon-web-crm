# GitHub Personal Access Token Setup

## The Problem
GitHub removed password authentication in August 2021. You need a Personal Access Token instead.

## Solution: Create Personal Access Token

### Step 1: Generate Token
1. Go to [GitHub.com](https://github.com) and login
2. Click your profile picture → **Settings**
3. Scroll down to **Developer settings** (left sidebar)
4. Click **Personal access tokens** → **Tokens (classic)**
5. Click **Generate new token** → **Generate new token (classic)**

### Step 2: Configure Token
**Token Settings:**
- **Note**: `ISKCON Juhu Website Deployment`
- **Expiration**: 90 days (or custom)
- **Select scopes**: Check these boxes:
  - ✅ `repo` (Full control of private repositories)
  - ✅ `workflow` (Update GitHub Action workflows)

### Step 3: Copy Token
1. Click **Generate token**
2. **IMPORTANT**: Copy the token immediately (you won't see it again)
3. Save it securely

## Using the Token in Replit

### Method 1: Direct Push with Token
```bash
git push -u origin main --force
```

When prompted:
- **Username**: `Saty-27`
- **Password**: Paste your Personal Access Token (not your GitHub password)

### Method 2: Update Remote URL with Token
```bash
# Remove existing remote
git remote remove origin

# Add remote with token embedded
git remote add origin https://Saty-27:YOUR_TOKEN_HERE@github.com/Saty-27/IskconJuhuWebsite.git

# Push
git push -u origin main --force
```

Replace `YOUR_TOKEN_HERE` with your actual token.

## Quick Fix Commands

Run these in Replit Shell:

```bash
# Check current remote
git remote -v

# If you have the token, use this format:
git remote set-url origin https://Saty-27:YOUR_TOKEN_HERE@github.com/Saty-27/IskconJuhuWebsite.git

# Then push
git push -u origin main --force
```

## Security Note
- Never share your Personal Access Token
- Treat it like a password
- If compromised, delete and create a new one

## After Successful Push
Your repository will be updated with the complete ISKCON Juhu Donation System, ready for VPS deployment.

## Alternative: GitHub CLI
If you prefer, you can also use GitHub CLI:
```bash
# Install GitHub CLI (if available)
gh auth login

# Push using GitHub CLI
gh repo view Saty-27/IskconJuhuWebsite
git push -u origin main --force
```

The Personal Access Token is the standard way to authenticate with GitHub from command line.