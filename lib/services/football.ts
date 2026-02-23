/**
 * Llama a API-Football 
 */
export class FootballService {
  private static apiKey = process.env.FOOTBALL_API_KEY;
  private static baseUrl = process.env.FOOTBALL_API_URL || 'https://v3.football.api-sports.io';


  private static async fetchFromApi(endpoint: string) {
    if (!this.apiKey) {
      throw new Error('FOOTBALL_API_KEY is not defined');
    }

    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': this.apiKey,
        'x-rapidapi-host': 'v3.football.api-sports.io',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  static async getLeagues() {
    return this.fetchFromApi('leagues');
  }

  static async getLiveMatches() {
    return this.fetchFromApi('fixtures?live=all');
  }

  static async getMatchesByDate(date: string) {
    return this.fetchFromApi(`fixtures?date=${date}`);
  }
}
