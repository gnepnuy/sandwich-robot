const { expect } = require("chai");
const { ethers } = require("hardhat");
const IERC20 = require("../artifacts/contracts/IERC20.sol/IERC20.json")

describe("SandwichBot", function () {

  let sandwichBot;
  let wbnb;
  let account;
  let account2;

  beforeEach(async function(){
    const SandwichBot = await ethers.getContractFactory("SandwichBot");
    //bsc-bakeryswap
    const wbnbAddress = '0xae13d989dac2f0debff460ac112a837c89baa7cd';
    const factory = '0x152349604d49c2af10adee94b918b051104a143e';
    sandwichBot = await SandwichBot.deploy(wbnbAddress,factory);//部署合约
    await sandwichBot.deployed();


    [account,account2] = await ethers.getSigners();//拿到钱包

    wbnb = new ethers.Contract(wbnbAddress,IERC20.abi,account);//加载wbnb合约

    const amount = '20000000000000000';
    let tx = await wbnb.transfer(sandwichBot.address,amount);//转账wbnb到合约
    await tx.wait();
    const wbnbBalance = await wbnb.balanceOf(sandwichBot.address);
    console.log(wbnbBalance)
  });


  it("Expect a successful purchase", async function () {
    const buyToken = '0x4Fb99590cA95fc3255D9fA66a1cA46c43C34b09a';//banana
    const amount = '10000000000000000';
    const multiple = 1;
    await sandwichBot.buy(amount,multiple,buyToken);

    sandwichBot.connect(account2);
    await sandwichBot.sell(buyToken);

  });
});
