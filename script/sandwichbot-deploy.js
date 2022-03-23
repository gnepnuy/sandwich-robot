const { ethers } = require("hardhat");

async function main() {
    const SandwichBot = await ethers.getContractFactory("SandwichBot");
    
    //Start deployment, returning a promise that resolves to a contract object

    //bsc-test-apeswap
    const wbnb = '0xae13d989dac2f0debff460ac112a837c89baa7cd';
    const factory = '0x152349604d49c2af10adee94b918b051104a143e';


    const sandwichBot = await SandwichBot.deploy(wbnb,factory);
    console.log("sandwichBot Contract deployed to address:", sandwichBot.address);
 }
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });