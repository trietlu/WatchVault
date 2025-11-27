const hre = require("hardhat");

async function main() {
    const WatchRegistry = await hre.ethers.getContractFactory("WatchRegistry");
    const watchRegistry = await WatchRegistry.deploy();

    await watchRegistry.waitForDeployment();

    console.log(
        `WatchRegistry deployed to ${watchRegistry.target}`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
