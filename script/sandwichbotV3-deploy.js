const { ethers } = require("hardhat");

async function main() {
    const SandwichBotV3 = await ethers.getContractFactory("SandwichBotV3");
    
    //Start deployment, returning a promise that resolves to a contract object

    // //bsc-main-pancake
    // const wbnb = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';
    // const factory = '0xca143ce32fe78f1f7019d7d551a6402fc5350c73';
    // const ops = ['0xdaD6Ce241e4fd75e03d90a2E54478CA87382AA7d','0xeF7531B7cA509813F097992bf7baE6e55CE0f4a4','0xe47FB8F59aBC474b2Aa2FA445c716399C9dB37Db'];

     //bsc-test-apeswap
    //  const wbnb = '0xae13d989dac2f0debff460ac112a837c89baa7cd';
    // busd 0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7
     const factory = '0x152349604d49c2af10adee94b918b051104a143e';
     const ops = ['0x11Fa988e9AaeB2b587a3C2556C3F8E0617cD793C','0x0F02dCC32DfE976433dfF117ee0e1545A4239668'];


    const sandwichBotV3 = await SandwichBotV3.deploy(factory,ops);
    console.log("sandwichBot Contract deployed to address:", sandwichBotV3.address);
 }
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });