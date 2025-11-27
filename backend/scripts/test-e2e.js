import axios from 'axios';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../dist/config/contract.js';

const API_URL = 'http://localhost:3001';
const PROVIDER_URL = 'http://127.0.0.1:8545';

async function main() {
    try {
        console.log('Starting E2E Test...');

        // 1. Register User (or login)
        const email = `test${Date.now()}@example.com`;
        const password = 'password123';
        console.log(`Registering user: ${email}`);

        const authRes = await axios.post(`${API_URL}/auth/register`, { email, password });
        const token = authRes.data.token;
        console.log('User registered, token received.');

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Create Watch
        const serialNumber = `SN-${Date.now()}`;
        console.log(`Creating watch with serial: ${serialNumber}`);

        const watchRes = await axios.post(`${API_URL}/watches`, {
            brand: 'Rolex',
            model: 'Submariner',
            serialNumber
        }, { headers });

        const watchId = watchRes.data.watch.id;
        console.log(`Watch created with ID: ${watchId}`);

        // 3. Add Event
        console.log('Adding SERVICE event...');
        const eventRes = await axios.post(`${API_URL}/watches/${watchId}/events`, {
            eventType: 'SERVICE',
            payload: { description: 'Routine maintenance', location: 'NYC' }
        }, { headers });

        const event = eventRes.data;
        console.log('Event created:', event);

        if (!event.txHash) {
            throw new Error('Event does not have a txHash! Anchoring failed.');
        }
        console.log(`Anchored with TX: ${event.txHash}`);

        // 4. Verify on Blockchain
        console.log('Verifying on blockchain...');
        const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        // Listen for events (or just check past events)
        // Since we just sent it, we can query the transaction receipt or logs
        const receipt = await provider.getTransactionReceipt(event.txHash);
        if (!receipt) throw new Error('Transaction receipt not found');

        console.log('Transaction confirmed on chain.');
        console.log('E2E Test PASSED! ✅');

    } catch (error) {
        console.error('E2E Test FAILED ❌');
        if (error.response) {
            console.error('API Error:', error.response.data);
        } else {
            console.error(error);
        }
        process.exit(1);
    }
}

main();
