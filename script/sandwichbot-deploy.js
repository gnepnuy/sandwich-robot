const { ethers } = require("hardhat");

async function main() {
    const SandwichBot = await ethers.getContractFactory("SandwichBot");
    
    //Start deployment, returning a promise that resolves to a contract object

    //bsc-test-apeswap
    const wbnb = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';
    const factory = '0xca143ce32fe78f1f7019d7d551a6402fc5350c73';
    const fundUtilization = 500;
    const ops = ['0xdaD6Ce241e4fd75e03d90a2E54478CA87382AA7d','0xeF7531B7cA509813F097992bf7baE6e55CE0f4a4'];


    const sandwichBot = await SandwichBot.deploy(wbnb,factory,fundUtilization,ops);
    console.log("sandwichBot Contract deployed to address:", sandwichBot.address);
 }
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });