const { ethers } = require("hardhat");

async function main() {
    const GetBnb = await ethers.getContractFactory("GetBnb");
    
    //Start deployment, returning a promise that resolves to a contract object

    //bsc-test-apeswap
    const wbnb = 'xxxxxxxxxxxxxxx';


    const getBnb = await GetBnb.deploy(wbnb);
    console.log("getBnb Contract deployed to address:", getBnb.address);
 }
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });