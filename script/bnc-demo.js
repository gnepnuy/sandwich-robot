// For Node < v13 / CommonJS environments
const BlocknativeSdk = require('bnc-sdk');
const WebSocket = require('ws');
const ethers = require('ethers');
const SandwichBot = require('../artifacts/contracts/SandwichBot.sol/SandwichBot.json');
const Router = require('../abi/router.json');
const key = require('../privatekey.json');



const routerAddess = "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506";   //rinkeby-sushi router
const sandwichBotAddress = '0xED73fDb0649fB03fd7794a6a78CDBaAe9B0c32c0';

// let url = "https://bsc-dataseed1.defibit.io/";//bsc-main
// let url = "https://data-seed-prebsc-1-s1.binance.org:8545";//bsc-test
let url = "https://goerli.infura.io/v3/74d3de6db014405388a32e51189fb6fd";//rinkeby

let privateKey = key.key1;
let privateKey2 = key.key2;

let customHttpProvider = new ethers.providers.JsonRpcProvider(url);
let walletWithProvider = new ethers.Wallet(privateKey, customHttpProvider);
let wallet2 = new ethers.Wallet(privateKey2, customHttpProvider);


let sandwichBot = new ethers.Contract(sandwichBotAddress, SandwichBot.abi, walletWithProvider);
let router = new ethers.Contract(routerAddess,Router.abi,walletWithProvider);

// create options object
const options = {
  dappId: 'd3da6c32-5300-4f22-af99-f574da5843fe',
  // networkId: 56,
  networkId: 5,
  transactionHandlers: [event => recordTx(event.transaction)],
  ws: WebSocket,
  onerror: (error) => {console.log(error)}
}

// initialize and connect to the api
const blocknative = new BlocknativeSdk(options)

blocknative.configuration({
    scope: routerAddess, // [required] - either 'global' or valid Ethereum address
    filters: [{"contractCall.methodName":"swapExactETHForTokens"}], // [optional] - array of valid searchjs filter strings
    abi: [{
        "inputs": [
          {
            "internalType": "uint256",
            "name": "amountOutMin",
            "type": "uint256"
          },
          {
            "internalType": "address[]",
            "name": "path",
            "type": "address[]"
          },
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          }
        ],
        "name": "swapExactETHForTokens",
        "outputs": [
          {
            "internalType": "uint256[]",
            "name": "amounts",
            "type": "uint256[]"
          }
        ],
        "stateMutability": "payable",
        "type": "function"
      }], // [optional] - valid contract ABI
    watchAddress: Boolean // [optional] - Whether the server should automatically watch the "scope" value if it is an address
  })


const {
    emitter, // emitter object to listen for status updates
    details // initial account details which are useful for internal tracking: address
  } = blocknative.account(routerAddess)



  // register a callback for a txPool event
emitter.on("txPool", transaction => handlerPengdingTx(transaction))


// 这里定义两个map来记录交易的状态
var txInfo = new Map();
function recordTx(transaction){
    //console.log('current time:',new Date().getTime());
    if(transaction.status == 'pending'){
        txInfo.set(transaction.hash,transaction);
        //console.log('find new pending transaction，hash:',transaction.hash);
    }else{
        if(txInfo.has(transaction.hash)){
            txInfo.delete(transaction.hash);
            //console.log('transaction status is change, remove the transaction.hash:',transaction.hash);
        }
    }
    //console.log('--------------------------------------------------------------------')
}

async function handlerPengdingTx(transaction){
  console.log('current time:',new Date().getTime()/1000);
  console.log("Transaction is pending:",JSON.stringify(transaction))
  const paths = transaction.contractCall.params.path;
  console.log('===================path:',paths);
  const toCoin = paths[paths.length-1];
 
  console.log('hash:',transaction.hash);

  //计算出当前交易的滑点
  // const amountIn = transaction.value;

  // const amountOut = await router.getAmountsOut(amountIn,paths);//查询当前能换的数量
  // console.log('current time for get amount after:',new Date().getTime()/1000);
  // const expectAmountOut = amountOut[paths.length - 1].toString();//当前能换的数量  
  // const minAmountOut = transaction.contractCall.params.amountOutMin;//设定的最少能换的数量

  // const slippage = ((expectAmountOut - minAmountOut) / expectAmountOut) * 100;


  // console.log('slippage:',slippage,'%');
  // if(slippage < 5){
  //   return;//滑点小于5时，放过
  // }
  // //计算出盈利空间
  //   //这里直接使用目标交易的数量和滑点的大小来确定我们要使用的资金量
  // const maxMultiple = Math.floor((slippage/0.5) - 2);//最大倍数减去2，试试
  
  //组装交易
  //let sandwichBotByWallet = sandwichBot.connect(walletWithProvider);
  const maxFeePerGas = transaction.maxFeePerGas;
  let overrides = {
    gasPrice: maxFeePerGas *2,
    gasLimit: 150816,
  };
  //console.log('amountIn:',amountIn,',maxMultiple:',maxMultiple,',toCoin:',toCoin);
  const amountIn = 1000000000000000;
  const maxMultiple = 10;
  sandwichBot.buy(amountIn,maxMultiple,toCoin,overrides);

  overrides = {
    gasPrice: maxFeePerGas-20,
    gasLimit: 110816,
  };
  sandwichBot.connect(wallet2).sell(toCoin,overrides);

  
  //console.log('----------------------buy hash:',tx.hash,'----------------------------------------------')
  console.log('end time:',new Date().getTime()/1000);


}