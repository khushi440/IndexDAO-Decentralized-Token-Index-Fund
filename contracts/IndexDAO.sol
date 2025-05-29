// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IndexDAO
 * @dev Simple Decentralized Token Index Fund with 3 core functions
 */
contract IndexDAO is ERC20, ReentrancyGuard, Ownable {
    
    uint256 public minimumDeposit = 0.01 ether;
    
    event IndexTokensMinted(address indexed user, uint256 amount, uint256 ethValue);
    event IndexTokensRedeemed(address indexed user, uint256 amount, uint256 ethValue);
    event MinimumDepositUpdated(uint256 newMinimum);

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) Ownable(msg.sender) {}

    /**
     * @dev Mint index tokens by depositing ETH
     * Users deposit ETH and receive proportional index tokens
     */
    function mintWithETH() external payable nonReentrant {
        require(msg.value >= minimumDeposit, "Below minimum deposit");
        
        uint256 indexTokensToMint;
        
        if (totalSupply() == 0) {
            // First mint: 1 ETH = 1000 Index Tokens
            indexTokensToMint = msg.value * 1000;
        } else {
            // Calculate tokens based on current ratio
            indexTokensToMint = (msg.value * totalSupply()) / address(this).balance - msg.value;
        }
        
        require(indexTokensToMint > 0, "Invalid mint amount");
        
        _mint(msg.sender, indexTokensToMint);
        
        emit IndexTokensMinted(msg.sender, indexTokensToMint, msg.value);
    }

    /**
     * @dev Redeem index tokens for proportional ETH value
     * @param _amount Amount of index tokens to redeem
     */
    function redeemForETH(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        
        uint256 ethValue = (_amount * address(this).balance) / totalSupply();
        require(address(this).balance >= ethValue, "Insufficient contract balance");
        
        _burn(msg.sender, _amount);
        payable(msg.sender).transfer(ethValue);
        
        emit IndexTokensRedeemed(msg.sender, _amount, ethValue);
    }

    /**
     * @dev Update minimum deposit amount (only owner)
     * @param _newMinimum New minimum deposit in wei
     */
    function updateMinimumDeposit(uint256 _newMinimum) external onlyOwner {
        require(_newMinimum > 0, "Minimum must be greater than 0");
        minimumDeposit = _newMinimum;
        
        emit MinimumDepositUpdated(_newMinimum);
    }

    // Receive ETH
    receive() external payable {}
}