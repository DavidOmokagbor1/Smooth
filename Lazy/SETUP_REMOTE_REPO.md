# 🚀 Setting Up Remote Repository

## Step 1: Create GitHub Repository

### Option A: Using GitHub Website (Recommended)
1. Go to https://github.com/new
2. Repository name: `Lazy` (or `lazy-ai-companion`)
3. Description: "AI-Powered Executive Function Companion - Voice-first task planning app"
4. Choose: **Private** (recommended) or **Public**
5. **DO NOT** initialize with README, .gitignore, or license (we already have files)
6. Click **"Create repository"**

### Option B: Using GitHub CLI (if installed)
```bash
gh repo create Lazy --private --description "AI-Powered Executive Function Companion"
```

## Step 2: Add Remote and Push

After creating the repository, GitHub will show you commands. Use these:

```bash
cd "/Volumes/2-2-22/BEATZBYJAVA PRODUCTIONS WEB/Smooth/Lazy"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/Lazy.git

# Or if using SSH:
# git remote add origin git@github.com:YOUR_USERNAME/Lazy.git

# Push your commits
git branch -M main
git push -u origin main
```

## Step 3: Verify

```bash
git remote -v
git log --oneline
```

You should see your remote and all commits pushed!

