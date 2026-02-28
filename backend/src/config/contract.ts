import { ethers } from 'ethers';
import { env } from './env.js';

export const CONTRACT_ADDRESS = env.chainContractAddress ?? '';

export const CONTRACT_ABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "watchHash",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "uint8",
                "name": "eventType",
                "type": "uint8"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "payloadHash",
                "type": "bytes32"
            }
        ],
        "name": "EventRecorded",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "watchHash",
                "type": "bytes32"
            },
            {
                "internalType": "uint8",
                "name": "eventType",
                "type": "uint8"
            },
            {
                "internalType": "bytes32",
                "name": "payloadHash",
                "type": "bytes32"
            }
        ],
        "name": "recordEvent",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

export const getContract = () => {
    if (!env.blockchainEnabled || !env.chainRpcUrl || !env.chainPrivateKey || !env.chainContractAddress) {
        throw new Error('Blockchain is not configured');
    }

    const provider = new ethers.JsonRpcProvider(env.chainRpcUrl);
    const signer = new ethers.Wallet(env.chainPrivateKey, provider);
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};
