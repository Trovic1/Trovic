const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying with: ${deployer.address}`);

  const gridWidth = Number(process.env.GRID_WIDTH || 10);
  const gridHeight = Number(process.env.GRID_HEIGHT || 10);

  const Token = await hre.ethers.getContractFactory("AvalonResourceToken");
  const token = await Token.deploy(deployer.address);
  await token.waitForDeployment();

  const Land = await hre.ethers.getContractFactory("AvalonRiftLand");
  const land = await Land.deploy(deployer.address, await token.getAddress(), gridWidth, gridHeight);
  await land.waitForDeployment();

  const setMinterTx = await token.setMinter(await land.getAddress());
  await setMinterTx.wait();

  console.log("AvalonResourceToken:", await token.getAddress());
  console.log("AvalonRiftLand:", await land.getAddress());

  console.log("Minting initial tiles for demo...");
  await (await land.mintTile(deployer.address, 0, 0, 20, 2)).wait();
  await (await land.mintTile(deployer.address, 1, 0, 18, 3)).wait();
  await (await land.mintTile(deployer.address, 2, 0, 25, 1)).wait();

  console.log("Deployment complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
