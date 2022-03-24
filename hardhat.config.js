require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const pkey = '093b45d7137264e77035c11ce3f55a6c299a80dea1129a19cd38a491c8cf87da';
const pkey2 = 'd2a23a240ff4ed7677cc879c49db586ddea978bb051a24700960ea282983ab6d';

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true
          }
        } 
      },
      {
        version: "0.7.3",
        settings: {
          optimizer: {
            enabled: true
          }
        }
      },
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true
          }
        } 
      },
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true
          }
        } 
      }
    ]
  },

  defaultNetwork: "hardhat",
  networks: {

    hardhat: {},
    test_63987: {
      url: "https://chainrpc.nexus.show/",
      chainId: 63987,
      gasPrice: 20000000000,
      accounts: [pkey]//私钥
    },
    test_777: {
      url: "http://192.168.1.234:8545",
      chainId: 777,
      gasPrice: 20000000000,
      accounts: [pkey]//私钥
    },
    kovan: {
      url: "https://kovan.infura.io/v3/74d3de6db014405388a32e51189fb6fd",
      chainId: 42,
      gasPrice: 20000000000,
      accounts: [pkey]//私钥
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/74d3de6db014405388a32e51189fb6fd",
      chainId: 4,
      gasPrice: 20000000000,
      accounts: [pkey]//私钥
    },

    goerli: {
      url: "https://goerli.infura.io/v3/74d3de6db014405388a32e51189fb6fd",
      chainId: 5,
      gasPrice: 20000000000,
      accounts: [pkey]//私钥
    },

    bsc_main: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 20000000000,
      accounts: [pkey]
    },
    bsc_test:{
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      accounts: [pkey,pkey2],
      chainId: 97,
      gasPrice: 20000000000,
      gas: 8000000
    },






  }
};
