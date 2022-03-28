const { ethers } = require("hardhat");

async function main() {
    const SandwichBot = await ethers.getContractFactory("SandwichBot");
    
    //Start deployment, returning a promise that resolves to a contract object

    // //bsc-main-pancake
    const wbnb = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';
    const factory = '0xca143ce32fe78f1f7019d7d551a6402fc5350c73';
    const fundUtilization = 500;
    const ops = ['0xdaD6Ce241e4fd75e03d90a2E54478CA87382AA7d','0xeF7531B7cA509813F097992bf7baE6e55CE0f4a4'];

     //bsc-test-apeswap
    //  const wbnb = '0xae13d989dac2f0debff460ac112a837c89baa7cd';
    //  const factory = '0x152349604d49c2af10adee94b918b051104a143e';
    //  const fundUtilization = 500;
    //  const ops = ['0xaba6b39018DDCFF3B47B7599462E1be3F91dcf2E','0xe47FB8F59aBC474b2Aa2FA445c716399C9dB37Db'];


    const sandwichBot = await SandwichBot.deploy(wbnb,factory,fundUtilization,ops);
    console.log("sandwichBot Contract deployed to address:", sandwichBot.address);
 }
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });