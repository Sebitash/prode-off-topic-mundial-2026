<<<<<<<< HEAD:backend/src/tests/api-test.js
import * as dotenv from 'dotenv';
import path from 'path';
import { FootballService } from '../services/football.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function verifyConnection() {
    console.log('\n==========================================');
    console.log('      FOOTBALL API - TEST RUN      ');
    console.log('==========================================\n');

    const apiKey = process.env.FOOTBALL_API_KEY;
    console.log('Checking Environment:');
    console.log('   - Base URL:', process.env.FOOTBALL_API_URL || 'https://v3.football.api-sports.io');
    console.log('\nStarting API Call...');

    try {
        const data = await FootballService.getLeagues();

        if (data && data.results > 0) {
            console.log('\nCONNECTION SUCCESSFUL!');
            console.log(`Found ${data.results} leagues available.`);
            console.log(`Example League: ${data.response[0].league.name}`);
            console.log('Country:', data.response[0].country.name);
        } else {
            console.log('\nAPI RESPONSE EMPTY OR UNKNOWN');
            console.log('Response Body:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.log('\nERROR DETECTED:');
        console.error('   Message:', error.message);
    }

    console.log('TEST COMPLETED SUCCESSFULLY');
}

verifyConnection();
========
import * as dotenv from 'dotenv';
import path from 'path';
import { FootballService } from '../lib/services/football.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function verifyConnection() {
    console.log('\n==========================================');
    console.log('      FOOTBALL API - TEST RUN      ');
    console.log('==========================================\n');

    const apiKey = process.env.FOOTBALL_API_KEY;
    console.log('Checking Environment:');
    console.log('   - Base URL:', process.env.FOOTBALL_API_URL || 'https://v3.football.api-sports.io');
    console.log('\nStarting API Call...');

    try {
        const data = await FootballService.getLeagues() as any;

        if (data && data.results > 0) {
            console.log('\nCONNECTION SUCCESSFUL!');
            console.log(`Found ${data.results} leagues available.`);
            console.log(`Example League: ${data.response[0].league.name}`);
            console.log('Country:', data.response[0].country.name);
        } else {
            console.log('\nAPI RESPONSE EMPTY OR UNKNOWN');
            console.log('Response Body:', JSON.stringify(data, null, 2));
        }
    } catch (error: any) {
        console.log('\nERROR DETECTED:');
        console.error('   Message:', error.message);
    }

    console.log('TEST COMPLETED SUCCESSFULLY');
}

verifyConnection();
>>>>>>>> origin/main:backend/src/tests/api-test.ts
