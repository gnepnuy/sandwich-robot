const { ethers } = require("hardhat");

async function main() {
    const SandwichBot = await ethers.getContractFactory("SandwichBot");
    
    //Start deployment, returning a promise that resolves to a contract object

    //bsc-test-apeswap
    const wbnb = '0xae13d989dac2f0debff460ac112a837c89baa7cd';
    const factory = '0x152349604d49c2af10adee94b918b051104a143e';
    const ops = ['0x0F02dCC32DfE976433dfF117ee0e1545A4239668','0x11Fa988e9AaeB2b587a3C2556C3F8E0617cD793C'];


    const sandwichBot = await SandwichBot.deploy(wbnb,factory,ops);
    console.log("sandwichBot Contract deployed to address:", sandwichBot.address);
 }
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });