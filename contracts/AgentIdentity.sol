// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AgentIdentity {
    struct Agent {
        address wallet;
        string name;
        string metadataURI;
        uint256 registeredAt;
        uint256 reputation;
        bool exists;
    }
    
    mapping(address => Agent) public agents;
    address[] public agentList;
    
    event AgentRegistered(address indexed wallet, string name, string metadataURI, uint256 timestamp);
    event ReputationUpdated(address indexed wallet, int256 delta, uint256 newScore);
    
    function registerAgent(address _wallet, string memory _name, string memory _metadataURI) external {
        require(!agents[_wallet].exists, "Agent already registered");
        
        agents[_wallet] = Agent({
            wallet: _wallet,
            name: _name,
            metadataURI: _metadataURI,
            registeredAt: block.timestamp,
            reputation: 0,
            exists: true
        });
        
        agentList.push(_wallet);
        emit AgentRegistered(_wallet, _name, _metadataURI, block.timestamp);
    }
    
    function updateReputation(address _wallet, int256 _delta) external {
        require(agents[_wallet].exists, "Agent not found");
        
        if (_delta > 0) {
            agents[_wallet].reputation += uint256(_delta);
        } else {
            uint256 decrease = uint256(-_delta);
            if (agents[_wallet].reputation >= decrease) {
                agents[_wallet].reputation -= decrease;
            } else {
                agents[_wallet].reputation = 0;
            }
        }
        
        emit ReputationUpdated(_wallet, _delta, agents[_wallet].reputation);
    }
    
    function getAgent(address _wallet) external view returns (
        address wallet, string memory name, string memory metadataURI,
        uint256 registeredAt, uint256 reputation, bool exists
    ) {
        Agent memory agent = agents[_wallet];
        return (agent.wallet, agent.name, agent.metadataURI, agent.registeredAt, agent.reputation, agent.exists);
    }
    
    function getAllAgents() external view returns (address[] memory) {
        return agentList;
    }
}
