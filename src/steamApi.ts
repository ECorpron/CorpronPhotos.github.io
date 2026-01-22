import axios from 'axios'

interface SteamGame {
  appid: number
  name: string
  playtime_forever: number
  img_icon_url?: string
  img_logo_url?: string
}

interface SteamResponse {
  response: {
    games: SteamGame[]
    game_count: number
  }
}

// Removed unused GameDetails interface

export class SteamGameRandomizer {
  private games: SteamGame[] = []
  private steamId: string = ''
  
  // Steam Web API key from environment variables
  private readonly STEAM_API_KEY = import.meta.env.VITE_STEAM_API_KEY
  private readonly CORS_PROXY = 'https://api.allorigins.win/raw?url='
  
  init() {
    this.setupEventListeners()
  }
  
  private setupEventListeners() {
    const loadButton = document.getElementById('loadGames') as HTMLButtonElement
    const pickAnotherButton = document.getElementById('pickAnother') as HTMLButtonElement
    const steamIdInput = document.getElementById('steamId') as HTMLInputElement
    
    loadButton?.addEventListener('click', () => this.loadGames())
    pickAnotherButton?.addEventListener('click', () => this.pickRandomGame())
    
    steamIdInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.loadGames()
      }
    })
  }
  
  private async loadGames() {
    const steamIdInput = document.getElementById('steamId') as HTMLInputElement
    this.steamId = steamIdInput.value.trim()
    
    if (!this.steamId) {
      this.showError('Please enter your Steam ID')
      return
    }
    
    if (!this.STEAM_API_KEY) {
      this.showError('Steam API key not configured. Please check your environment variables.')
      return
    }
    
    this.showLoading(true)
    this.hideError()
    
    try {
      // Using Steam Web API with your API key - don't encode the URL for this CORS proxy
      const steamApiUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${this.STEAM_API_KEY}&steamid=${this.steamId}&format=json&include_appinfo=true&include_played_free_games=true`
      const url = `${this.CORS_PROXY}${steamApiUrl}`
      
      console.log('Making request to:', url)
      
      const response = await axios.get<SteamResponse>(url)
      
      console.log('Response:', response.data)
      
      if (!response.data.response || !response.data.response.games) {
        this.showError('No games found. Make sure your Steam ID is correct and your game details are public.')
        return
      }
      
      this.games = response.data.response.games
      
      if (this.games.length === 0) {
        this.showError('No games found in your library.')
        return
      }
      
      this.showLoading(false)
      this.pickRandomGame()
      
    } catch (error) {
      console.error('Error loading games:', error)
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response data:', error.response.data)
        this.showError(`API Error: ${error.response.status} - ${error.response.data}`)
      } else {
        this.showError('Failed to load games. Make sure your Steam ID is correct and your game details are public.')
      }
      this.showLoading(false)
    }
  }
  
  private pickRandomGame() {
    if (this.games.length === 0) {
      this.showError('No games loaded. Please load your games first.')
      return
    }
    
    const randomIndex = Math.floor(Math.random() * this.games.length)
    const selectedGame = this.games[randomIndex]
    
    this.displayGame(selectedGame)
  }
  
  private displayGame(game: SteamGame) {
    const gameResult = document.getElementById('gameResult')
    const gameCard = document.getElementById('gameCard')
    
    if (!gameResult || !gameCard) return
    
    const hoursPlayed = Math.round(game.playtime_forever / 60 * 10) / 10
    const steamUrl = `https://store.steampowered.com/app/${game.appid}`
    
    // Steam CDN URL for game logo
    const logoUrl = game.img_logo_url ? 
      `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_logo_url}.jpg` : ''
    
    gameCard.innerHTML = `
      <h3>${game.name}</h3>
      ${logoUrl ? `<img src="${logoUrl}" alt="${game.name}" onerror="this.style.display='none'" />` : ''}
      <p><strong>Hours Played:</strong> ${hoursPlayed}</p>
      <p><a href="${steamUrl}" target="_blank" rel="noopener">View on Steam Store</a></p>
    `
    
    gameResult.classList.remove('hidden')
  }
  
  private showLoading(show: boolean) {
    const loading = document.getElementById('loading')
    if (loading) {
      loading.classList.toggle('hidden', !show)
    }
  }
  
  private showError(message: string) {
    const error = document.getElementById('error')
    if (error) {
      error.textContent = message
      error.classList.remove('hidden')
    }
  }
  
  private hideError() {
    const error = document.getElementById('error')
    if (error) {
      error.classList.add('hidden')
    }
  }
}