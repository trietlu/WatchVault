// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract WatchRegistry {
    event EventRecorded(bytes32 indexed watchHash, uint8 eventType, bytes32 payloadHash);

    function recordEvent(bytes32 watchHash, uint8 eventType, bytes32 payloadHash) external {
        emit EventRecorded(watchHash, eventType, payloadHash);
    }
}
