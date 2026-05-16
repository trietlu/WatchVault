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
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "watchCommitment",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "eventId",
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
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "documentHash",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "uriHash",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "internalType": "uint16",
                "name": "schemaVersion",
                "type": "uint16"
            }
        ],
        "name": "ProofAnchored",
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
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "watchCommitment",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "eventId",
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
            },
            {
                "internalType": "bytes32",
                "name": "documentHash",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "uriHash",
                "type": "bytes32"
            },
            {
                "internalType": "uint16",
                "name": "schemaVersion",
                "type": "uint16"
            }
        ],
        "name": "anchorProof",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

export const getContract = () => {
    if (!env.blockchainEnabled || !env.chainRpcUrl || !env.chainPrivateKey || !env.chainContractAddress) {
        throw new Error('Blockchain is not configured');
    }

    const provider = new ethers.JsonRpcProvider(env.chainRpcUrl, env.chainId);
    const signer = new ethers.Wallet(env.chainPrivateKey, provider);
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

export const assertConfiguredChain = async () => {
    if (!env.blockchainEnabled || !env.chainRpcUrl || !env.chainId) {
        throw new Error('Blockchain is not configured');
    }

    const provider = new ethers.JsonRpcProvider(env.chainRpcUrl, env.chainId);
    const network = await provider.getNetwork();
    const actualChainId = Number(network.chainId);

    if (actualChainId !== env.chainId) {
        throw new Error(`Configured RPC chain mismatch: expected ${env.chainId}, got ${actualChainId}`);
    }
};
