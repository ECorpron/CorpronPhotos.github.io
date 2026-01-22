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

interface AchievementStats {
  playerstats: {
    steamID: string
    gameName: string
    achievements?: Array<{
      apiname: string
      achieved: number
      unlocktime: number
    }>
    success: boolean
  }
}

export class SteamGameRandomizer {
  private games: SteamGame[] = []
  private steamId: string = ''
  
  // Steam Web API key from environment variables
  private readonly STEAM_API_KEY = import.meta.env.VITE_STEAM_API_KEY
  // Try a different CORS proxy
  private readonly CORS_PROXY = 'https://corsproxy.io/?'
  
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
      // Try the ISteamUser interface instead - this is more commonly used
      const steamApiUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${this.STEAM_API_KEY}&steamids=${this.steamId}`
      const url = `${this.CORS_PROXY}${encodeURIComponent(steamApiUrl)}`
      
      console.log('Testing with ISteamUser first:', url)
      
      // First test if we can reach Steam API at all
      const testResponse = await axios.get(url)
      console.log('ISteamUser response:', testResponse.data)
      
      // If that works, try the games API
      const gamesApiUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${this.STEAM_API_KEY}&steamid=${this.steamId}&include_appinfo=1&include_played_free_games=1&format=json`
      const gamesUrl = `${this.CORS_PROXY}${encodeURIComponent(gamesApiUrl)}`
      
      console.log('Making games request to:', gamesUrl)
      
      const response = await axios.get<SteamResponse>(gamesUrl)
      
      console.log('Games response:', response.data)
      
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
        this.showError(`API Error: ${error.response.status} - Check console for details`)
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
  
  private async displayGame(game: SteamGame) {
    const gameResult = document.getElementById('gameResult')
    const gameCard = document.getElementById('gameCard')
    
    if (!gameResult || !gameCard) return
    
    const hoursPlayed = Math.round(game.playtime_forever / 60 * 10) / 10
    const steamUrl = `https://store.steampowered.com/app/${game.appid}`
    
    // Steam CDN URLs for different image types
    const headerImage = `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/header.jpg` // Main store header
    const capsuleImage = `https://cdn.akamai.steamstatic.com/steam/apps/${game.appid}/library_600x900.jpg` // Library portrait
    const iconUrl = game.img_icon_url ? 
      `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg` : ''
    
    gameCard.innerHTML = `
      <h3>${game.name}</h3>
      <div class="game-images">
        <img src="${headerImage}" alt="${game.name} header" class="game-header" onerror="this.style.display='none'" />
        <div class="game-secondary-images">
          ${iconUrl ? `<img src="${iconUrl}" alt="${game.name} icon" class="game-icon" onerror="this.style.display='none'" />` : ''}
          <img src="${capsuleImage}" alt="${game.name} capsule" class="game-capsule" onerror="this.style.display='none'" />
        </div>
      </div>
      <p><strong>Hours Played:</strong> ${hoursPlayed}</p>
      <p id="achievements-${game.appid}"><em>Loading achievements...</em></p>
      <p><a href="${steamUrl}" target="_blank" rel="noopener">View on Steam Store</a></p>
    `
    
    gameResult.classList.remove('hidden')
    
    // Load achievements asynchronously
    this.loadAchievements(game.appid)
  }
  
  private async loadAchievements(appId: number) {
    try {
      const achievementsUrl = `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?appid=${appId}&key=${this.STEAM_API_KEY}&steamid=${this.steamId}`
      const url = `${this.CORS_PROXY}${encodeURIComponent(achievementsUrl)}`
      
      console.log('Loading achievements for app:', appId)
      
      const response = await axios.get<AchievementStats>(url)
      
      if (response.data.playerstats && response.data.playerstats.success && response.data.playerstats.achievements) {
        const achievements = response.data.playerstats.achievements
        const totalAchievements = achievements.length
        const unlockedAchievements = achievements.filter(a => a.achieved === 1).length
        
        const achievementElement = document.getElementById(`achievements-${appId}`)
        if (achievementElement) {
          const percentage = totalAchievements > 0 ? Math.round((unlockedAchievements / totalAchievements) * 100) : 0
          achievementElement.innerHTML = `<strong>Achievements:</strong> ${unlockedAchievements}/${totalAchievements} (${percentage}%)`
        }
      } else {
        // No achievements or private stats
        const achievementElement = document.getElementById(`achievements-${appId}`)
        if (achievementElement) {
          achievementElement.innerHTML = `<strong>Achievements:</strong> No achievement data available`
        }
      }
    } catch (error) {
      console.log('Could not load achievements for app:', appId, error)
      const achievementElement = document.getElementById(`achievements-${appId}`)
      if (achievementElement) {
        achievementElement.innerHTML = `<strong>Achievements:</strong> No achievement data available`
      }
    }
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