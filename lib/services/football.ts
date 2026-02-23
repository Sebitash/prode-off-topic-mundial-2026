/**
 * Llama a API-Football 
 */
export class FootballService {

  private static async fetchFromApi(endpoint: string) {
    const apiKey = process.env.FOOTBALL_API_KEY;
    const baseUrl = process.env.FOOTBALL_API_URL || 'https://v3.football.api-sports.io';

    if (!apiKey) {
      throw new Error('FOOTBALL_API_KEY is not defined in environment variables');
    }

    const response = await fetch(`${baseUrl}/${endpoint}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'v3.football.api-sports.io',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.message || response.statusText}`);
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
