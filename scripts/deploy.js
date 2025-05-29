const { ethers } = require("hardhat");

async function main() {
  console.log("Starting IndexDAO deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Check deployer balance
  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

  // Contract constructor parameters
  const tokenName = "IndexDAO Token";
  const tokenSymbol = "IDAO";

  console.log("Deploying IndexDAO with parameters:");
  console.log("- Name:", tokenName);
  console.log("- Symbol:", tokenSymbol);

  // Get the contract factory
  const IndexDAO = await ethers.getContractFactory("IndexDAO");

  // Deploy the contract
  console.log("Deploying contract...");
  const indexDAO = await IndexDAO.deploy(tokenName, tokenSymbol);

  // Wait for deployment to complete
  await indexDAO.deployed();

  console.log("✅ IndexDAO deployed successfully!");
  console.log("Contract address:", indexDAO.address);
  console.log("Transaction hash:", indexDAO.deployTransaction.hash);

  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await indexDAO.deployTransaction.wait(5);

  // Display contract details
  console.log("\n📋 Contract Details:");
  console.log("- Contract Address:", indexDAO.address);
  console.log("- Token Name:", await indexDAO.name());
  console.log("- Token Symbol:", await indexDAO.symbol());
  console.log(
    "- Minimum Deposit:",
    ethers.utils.formatEther(await indexDAO.minimumDeposit()),
    "ETH"
  );
  console.log("- Owner:", await indexDAO.owner());

  // Save deployment info to file
  const deploymentInfo = {
    contractAddress: indexDAO.address,
    contractName: "IndexDAO",
    network: hre.network.name,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: indexDAO.deployTransaction.hash,
    blockNumber: indexDAO.deployTransaction.blockNumber,
  };

  const fs = require("fs");
  const path = require("path");

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  // Save deployment info
  const deploymentFile = path.join(
    deploymentsDir,
    `IndexDAO_${hre.network.name}.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);

  // Verification message
  console.log("\n🔍 To verify the contract on Etherscan, run:");
  console.log(
    `npx hardhat verify --network ${hre.network.name} ${indexDAO.address} "${tokenName}" "${tokenSymbol}"`
  );

  console.log("\n🎉 Deployment completed successfully!");
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
