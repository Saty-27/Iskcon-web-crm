# File Transfer Guide for ISKCON Juhu Donation System

## Option 1: Using SCP (Secure Copy) - Recommended

### From your local machine (where you have the project files):

1. **Create a zip file of your project** (excluding node_modules):
   ```bash
   # On your local machine
   zip -r iskcon-juhu.zip . -x "node_modules/*" ".git/*" "*.log"
   ```

2. **Transfer the zip file to your VPS**:
   ```bash
   scp iskcon-juhu.zip username@your-server-ip:/var/www/iskcon-juhu/
   ```

3. **On your VPS, extract the files**:
   ```bash
   ssh username@your-server-ip
   cd /var/www/iskcon-juhu
   unzip iskcon-juhu.zip
   rm iskcon-juhu.zip
   ```

## Option 2: Using SFTP

1. **Connect via SFTP**:
   ```bash
   sftp username@your-server-ip
   ```

2. **Navigate to the application directory**:
   ```bash
   cd /var/www/iskcon-juhu
   ```

3. **Upload files**:
   ```bash
   put -r /path/to/your/local/project/* .
   ```

## Option 3: Using Git (if you have a repository)

1. **Initialize git repository in your project** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to a Git repository** (GitHub, GitLab, etc.)

3. **Clone on your VPS**:
   ```bash
   ssh username@your-server-ip
   cd /var/www/iskcon-juhu
   git clone https://github.com/yourusername/iskcon-juhu.git .
   ```

## Option 4: Using WinSCP (Windows users)

1. Download and install WinSCP
2. Connect to your VPS using SSH details
3. Navigate to `/var/www/iskcon-juhu/` on the server
4. Drag and drop your project files

## Essential Files to Upload

Make sure you upload these key files:
- `package.json`
- `package-lock.json`
- All source code files in `client/`, `server/`, `shared/`
- `tsconfig.json`
- `vite.config.ts`
- `tailwind.config.ts`
- `postcss.config.js`
- `drizzle.config.ts`
- `components.json`
- Any existing `uploads/` directory with images

## Files NOT to Upload

Don't upload these files/directories:
- `node_modules/` (will be installed on server)
- `.git/` (unless using git method)
- `*.log` files
- `.env` file (create new one on server)
- `dist/` or `build/` folders (will be generated)

## After File Transfer

1. **Set proper permissions**:
   ```bash
   sudo chown -R $USER:$USER /var/www/iskcon-juhu
   find /var/www/iskcon-juhu -type d -exec chmod 755 {} \;
   find /var/www/iskcon-juhu -type f -exec chmod 644 {} \;
   ```

2. **Create .env file**:
   ```bash
   cp .env.template .env
   nano .env
   # Fill in your actual API keys and secrets
   ```

3. **Install dependencies and deploy**:
   ```bash
   cd /var/www/iskcon-juhu
   ./deploy.sh
   ```

## Quick Upload Script

Here's a quick script to automate the upload process:

```bash
#!/bin/bash
# Run this from your local machine

SERVER_IP="your-server-ip"
SERVER_USER="your-username"
LOCAL_PROJECT_PATH="/path/to/your/iskcon-juhu-project"

# Create zip file
cd $LOCAL_PROJECT_PATH
zip -r iskcon-juhu.zip . -x "node_modules/*" ".git/*" "*.log" "dist/*" "build/*"

# Upload to server
scp iskcon-juhu.zip $SERVER_USER@$SERVER_IP:/var/www/iskcon-juhu/

# Extract on server
ssh $SERVER_USER@$SERVER_IP "cd /var/www/iskcon-juhu && unzip -o iskcon-juhu.zip && rm iskcon-juhu.zip"

echo "Upload completed!"
```

Save this as `upload.sh`, make it executable (`chmod +x upload.sh`), and run it from your local machine.