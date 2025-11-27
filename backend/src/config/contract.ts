import { ethers } from 'ethers';

export const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

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
    // Connect to local hardhat node
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    // Use the first account from hardhat node as the signer
    // In production, this would be a private key from env
    const signer = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};
