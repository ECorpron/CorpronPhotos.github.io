# Steam Game Randomizer

A simple web app that picks a random game from your Steam library when you can't decide what to play!

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

4. Get your Steam Web API key from [https://steamcommunity.com/dev/apikey](https://steamcommunity.com/dev/apikey)

5. Add your Steam API key to the `.env` file:
   ```
   VITE_STEAM_API_KEY=your_steam_api_key_here
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Enter your Steam ID (the long number, like `76561198046373486`)
2. Make sure your Steam profile's "Game details" are set to public
3. Click "Load My Games" to fetch your library
4. Click "Pick Another Game" to get a new random suggestion

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to GitHub Pages or any static hosting service.

## Deploying to GitHub Pages

1. Build the project:
   ```bash
   npm run build
   ```

2. **Important**: You need to set your Steam API key as a GitHub secret:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add a new repository secret: `VITE_STEAM_API_KEY` with your Steam API key value

3. **Option A - Manual deployment:**
   - Copy all files from the `dist/` folder to your repository root
   - Commit and push to GitHub
   - Enable GitHub Pages in repository settings

4. **Option B - Automated deployment (recommended):**
   - Create `.github/workflows/deploy.yml` (see below)
   - Push your source code to the `main` branch
   - GitHub Actions will automatically build and deploy

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      env:
        VITE_STEAM_API_KEY: ${{ secrets.VITE_STEAM_API_KEY }}
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## Finding Your Steam ID

You can find your Steam ID by:
1. Going to your Steam profile
2. Right-clicking and selecting "Copy Page URL"
3. The long number in the URL is your Steam ID

Or use a tool like [SteamID Finder](https://steamidfinder.com/)