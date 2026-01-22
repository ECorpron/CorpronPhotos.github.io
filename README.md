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

1. Enter your Steam ID (the long number, like `76561198000000000`)
2. Make sure your Steam profile's "Game details" are set to public
3. Click "Load My Games" to fetch your library
4. Click "Pick Another Game" to get a new random suggestion

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to GitHub Pages or any static hosting service.

## Finding Your Steam ID

You can find your Steam ID by:
1. Going to your Steam profile
2. Right-clicking and selecting "Copy Page URL"
3. The long number in the URL is your Steam ID

Or use a tool like [SteamID Finder](https://steamidfinder.com/)