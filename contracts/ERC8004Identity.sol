// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ERC8004AgentIdentity
 * @dev ERC-8004 compliant agent identity registry
 * Implements: Agent Identity, Reputation, and Validation
 */
contract ERC8004AgentIdentity is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // Agent Identity Structure
    struct AgentIdentity {
        string agentName;
        string metadataURI;
        address agentWallet;
        uint256 createdAt;
        uint256 reputationScore;
        bool isActive;
    }
    
    // Validation Structure
    struct Validation {
        bytes32 actionHash;
        uint8 score;
        address validator;
        uint256 timestamp;
        string metadata;
    }
    
    // Mappings
    mapping(uint256 => AgentIdentity) public agentIdentities;
    mapping(uint256 => Validation[]) public validations;
    mapping(address => uint256) public walletToAgentId;
    
    // Events
    event AgentRegistered(uint256 indexed agentId, string name, address wallet);
    event ValidationRecorded(uint256 indexed agentId, bytes32 actionHash, uint8 score);
    event ReputationUpdated(uint256 indexed agentId, uint256 newScore);
    
    constructor() ERC721("VANIJ Agent Identity", "VANIJ") Ownable(msg.sender) {}
    
    /**
     * @dev Register a new agent identity
     */
    function registerAgent(
        string memory _name,
        string memory _metadataURI,
        address _agentWallet
    ) public returns (uint256) {
        require(walletToAgentId[_agentWallet] == 0, "Wallet already registered");
        
        uint256 agentId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(msg.sender, agentId);
        _setTokenURI(agentId, _metadataURI);
        
        agentIdentities[agentId] = AgentIdentity({
            agentName: _name,
            metadataURI: _metadataURI,
            agentWallet: _agentWallet,
            createdAt: block.timestamp,
            reputationScore: 0,
            isActive: true
        });
        
        walletToAgentId[_agentWallet] = agentId;
        
        emit AgentRegistered(agentId, _name, _agentWallet);
        return agentId;
    }
    
    /**
     * @dev Record a validation for an agent action
     */
    function recordValidation(
        uint256 _agentId,
        bytes32 _actionHash,
        uint8 _score,
        string memory _metadata
    ) public {
        require(_exists(_agentId), "Agent does not exist");
        require(_score <= 100, "Score must be 0-100");
        
        validations[_agentId].push(Validation({
            actionHash: _actionHash,
            score: _score,
            validator: msg.sender,
            timestamp: block.timestamp,
            metadata: _metadata
        }));
        
        // Update reputation score (rolling average)
        AgentIdentity storage agent = agentIdentities[_agentId];
        uint256 totalValidations = validations[_agentId].length;
        agent.reputationScore = (agent.reputationScore * (totalValidations - 1) + _score) / totalValidations;
        
        emit ValidationRecorded(_agentId, _actionHash, _score);
        emit ReputationUpdated(_agentId, agent.reputationScore);
    }
    
    /**
     * @dev Get agent's current reputation score
     */
    function getReputation(uint256 _agentId) public view returns (uint256) {
        require(_exists(_agentId), "Agent does not exist");
        return agentIdentities[_agentId].reputationScore;
    }
    
    /**
     * @dev Get validation count for an agent
     */
    function getValidationCount(uint256 _agentId) public view returns (uint256) {
        return validations[_agentId].length;
    }
    
    /**
     * @dev Get agent identity details
     */
    function getAgentIdentity(uint256 _agentId) public view returns (
        string memory name,
        address wallet,
        uint256 createdAt,
        uint256 reputation,
        bool isActive
    ) {
        require(_exists(_agentId), "Agent does not exist");
        AgentIdentity memory agent = agentIdentities[_agentId];
        return (
            agent.agentName,
            agent.agentWallet,
            agent.createdAt,
            agent.reputationScore,
            agent.isActive
        );
    }
    
    // The following functions are overrides required by Solidity.
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
