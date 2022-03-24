const { ethers } = require("hardhat");

async function main() {
    const SandwichBot = await ethers.getContractFactory("SandwichBot");
    
    //Start deployment, returning a promise that resolves to a contract object

    //bsc-test-apeswap
    const wbnb = '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6';
    const factory = '0xc35dadb65012ec5796536bd9864ed8773abc74c4';


    const sandwichBot = await SandwichBot.deploy(wbnb,factory);
    console.log("sandwichBot Contract deployed to address:", sandwichBot.address);
 }
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });