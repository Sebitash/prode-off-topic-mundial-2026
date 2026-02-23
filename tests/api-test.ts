import { FootballService } from '../lib/services/football';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testApi() {
    console.log('--- Testing API-Football Connection ---');
    console.log('Using URL:', process.env.FOOTBALL_API_URL);

    try {
        console.log('Fetching status...');
        const data = await FootballService.getLeagues();

        if (data.results > 0) {
            console.log('✅ Success! Found', data.results, 'leagues.');
            console.log('Sample league:', data.response[0].league.name);
        } else {
            console.log('⚠️ API returned 0 results. Check your subscription or parameters.');
            console.log('Full response:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('❌ API Test Failed:', error);
    }
}

testApi();
