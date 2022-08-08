// const Web3 = require('web3');



// const url = 'https://yunpeng:zyp6397328@apis.ankr.com/fb68bced829e441e90480ccdf48cc91d/3de214447059c3eade4cffa687e97bf4/binance/full/main'  // url string

// const web3 = new Web3(new Web3.providers.HttpProvider(url));

// web3.eth.getBlockNumber((error, blockNumber) => {
//     if(!error){
//         console.log(blockNumber);
//     }else{
//         console.log(error);
//     }
// });

const ethers = require('ethers');

var result = ethers.utils.keccak256('0x7a73829376e6D1Fd072031105E7F08f5e6F01c90A88D3318585733ff600052601b6005f3');
console.log(result);

