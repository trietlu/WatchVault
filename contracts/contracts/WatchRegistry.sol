// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract WatchRegistry {
    address public owner;
    mapping(address => bool) public authorizedWriters;

    event EventRecorded(bytes32 indexed watchHash, uint8 eventType, bytes32 payloadHash);
    event ProofAnchored(
        bytes32 indexed watchCommitment,
        bytes32 indexed eventId,
        uint8 eventType,
        bytes32 payloadHash,
        bytes32 documentHash,
        bytes32 uriHash,
        uint16 schemaVersion
    );
    event WriterAuthorizationChanged(address indexed writer, bool authorized);

    error Unauthorized();

    constructor() {
        owner = msg.sender;
        authorizedWriters[msg.sender] = true;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert Unauthorized();
        }
        _;
    }

    modifier onlyAuthorizedWriter() {
        if (!authorizedWriters[msg.sender]) {
            revert Unauthorized();
        }
        _;
    }

    function setAuthorizedWriter(address writer, bool authorized) external onlyOwner {
        authorizedWriters[writer] = authorized;
        emit WriterAuthorizationChanged(writer, authorized);
    }

    function recordEvent(bytes32 watchHash, uint8 eventType, bytes32 payloadHash) external onlyAuthorizedWriter {
        emit EventRecorded(watchHash, eventType, payloadHash);
    }

    function anchorProof(
        bytes32 watchCommitment,
        bytes32 eventId,
        uint8 eventType,
        bytes32 payloadHash,
        bytes32 documentHash,
        bytes32 uriHash,
        uint16 schemaVersion
    ) external onlyAuthorizedWriter {
        emit ProofAnchored(
            watchCommitment,
            eventId,
            eventType,
            payloadHash,
            documentHash,
            uriHash,
            schemaVersion
        );
    }
}
