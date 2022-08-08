const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GasToken", function () {

  let gasTokenTest;

  beforeEach(async function(){
    const GasTokenTest = await ethers.getContractFactory("GasTokenTest");

    gasTokenTest = await GasTokenTest.deploy();//部署合约
    await gasTokenTest.deployed();


  
    
  });


  it("Return gasprice", async function () {
    await gasTokenTest.getGasprice()
  });

  it("test if ", async function () {
    await gasTokenTest.returnGasTransfer(100,'0xab3B229eB4BcFF881275E7EA2F0FD24eeaC8C83a');
  })
});
