// For Node < v13 / CommonJS environments
const BlocknativeSdk = require('bnc-sdk');
const WebSocket = require('ws');
const ethers = require('ethers');
const SandwichBot = require('../artifacts/contracts/SandwichBot.sol/SandwichBot.json');
const Router = require('../abi/router.json');
const key = require('../privatekey.json');
const targetCoins = require('../targetCoins.json');



// const routerAddess = "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7";   //bsc-main apeswap
const routerAddess = "0x10ED43C718714eb63d5aA57B78B54704E256024E";   //bsc-main pancake



const sandwichBotAddress = '0xf93CD70eDaDD06438A76F0EE2AeA805d77f9748E';//bsc-v1

const urlInfo = {
  url: 'https://apis.ankr.com/fb68bced829e441e90480ccdf48cc91d/3de214447059c3eade4cffa687e97bf4/binance/full/main',
  user: 'yunpeng',
  password: 'zyp6397328',
  allowInsecure: false
}

const bscUrl_official = "https://bsc-dataseed2.binance.org/";

let privateKey = key.key1;
let privateKey2 = key.key2;

let customHttpProvider = new ethers.providers.JsonRpcProvider(urlInfo);
let officialProvider = new ethers.providers.JsonRpcProvider(bscUrl_official);
let walletWithProvider = new ethers.Wallet(privateKey, officialProvider);
let wallet2 = new ethers.Wallet(privateKey2, officialProvider);


let sandwichBot = new ethers.Contract(sandwichBotAddress, SandwichBot.abi, walletWithProvider);
let router = new ethers.Contract(routerAddess,Router.abi,walletWithProvider);

// create options object
const options = {
  // dappId: 'd3da6c32-5300-4f22-af99-f574da5843fe',
  dappId: '0d306f4c-3137-4c41-88f9-e618d8c7de98',
  networkId: 56,
  // networkId: 5,
  transactionHandlers: [event => recordTx(event.transaction)],
  ws: WebSocket,
  onerror: (error) => {console.log(error)}
}

// initialize and connect to the api
const blocknative = new BlocknativeSdk(options)

blocknative.configuration({
    scope: routerAddess, // [required] - either 'global' or valid Ethereum address 
    filters: [
      {"contractCall.methodName":"swapExactETHForTokens"},
      // {"contractCall.methodName":"swapExactTokensForTokens"}
    ], // [optional] - array of valid searchjs filter strings
    abi: [
      {
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
      },
      // {
      //   "inputs": [
      //     {
      //       "internalType": "uint256",
      //       "name": "amountIn",
      //       "type": "uint256"
      //     },
      //     {
      //       "internalType": "uint256",
      //       "name": "amountOutMin",
      //       "type": "uint256"
      //     },
      //     {
      //       "internalType": "address[]",
      //       "name": "path",
      //       "type": "address[]"
      //     },
      //     {
      //       "internalType": "address",
      //       "name": "to",
      //       "type": "address"
      //     },
      //     {
      //       "internalType": "uint256",
      //       "name": "deadline",
      //       "type": "uint256"
      //     }
      //   ],
      //   "name": "swapExactTokensForTokens",
      //   "outputs": [
      //     {
      //       "internalType": "uint256[]",
      //       "name": "amounts",
      //       "type": "uint256[]"
      //     }
      //   ],
      //   "stateMutability": "nonpayable",
      //   "type": "function"
      // }
    ], // [optional] - valid contract ABI
    watchAddress: Boolean // [optional] - Whether the server should automatically watch the "scope" value if it is an address
  })


const {
    emitter, // emitter object to listen for status updates
    details // initial account details which are useful for internal tracking: address
  } = blocknative.account(routerAddess)



  // register a callback for a txPool event
emitter.on("txPool", transaction => handlerPengdingTx(transaction))


// ??????????????????map????????????????????????
var txInfo = new Map();
function recordTx(transaction){
    //console.log('current time:',new Date().getTime());
    if(transaction.status == 'pending'){
        txInfo.set(transaction.hash,transaction);
        console.log('find new pending transaction???hash:',transaction.hash);
    }else{
        if(txInfo.has(transaction.hash)){
            txInfo.delete(transaction.hash);
            //console.log('transaction status is change, remove the transaction.hash:',transaction.hash);
        }
    }
    //console.log('--------------------------------------------------------------------')
}

var lastSendTime = 0

async function handlerPengdingTx(transaction){
  
  const receivePendingTime = new Date().getTime()/1000;
  // console.log("Transaction is pending:",JSON.stringify(transaction))
  const paths = transaction.contractCall.params.path;
  if(paths.length > 2){
    return
  }
  // console.log('===================path:',paths);
  const toCoin = paths[paths.length-1];


  // console.log(transaction)
  //???????????????????????????
  if(targetCoins.coins.join().indexOf(paths[1]) > 0){
     // //??????????????????????????????
    const amountIn = transaction.value;
    // console.log('amountIn:',amountIn)

    const beforeQueryTime = new Date().getTime()/1000;

    //????????????
    if((beforeQueryTime - 5) < lastSendTime){
      return
    }

    //??????????????????
    console.log('value:',transaction.value/1000000000000000000)
    if(transaction.value < 500000000000000000){
      return
    }
    const amountOut = await router.getAmountsOut(amountIn,paths);//???????????????????????????
    const afterQueryTime = new Date().getTime()/1000;


    const expectAmountOut = amountOut[paths.length - 1].toString();//?????????????????????  
    const minAmountOut = transaction.contractCall.params.amountOutMin;//??????????????????????????????

    const slippage = ((expectAmountOut - minAmountOut) / expectAmountOut) * 100;
    if(slippage > 5){
      //?????????????????????
      //?????????????????????????????????????????????????????????????????????????????????????????????
      let maxMultiple = Math.floor((slippage/0.5) - 2);//??????????????????2?????????
      if(maxMultiple > 3){
        maxMultiple =3
      }
      
      //????????????
      const maxFeePerGas = transaction.gasPrice;
      const standardGas = 5000000000;
      let sellGas = standardGas;
      if(maxFeePerGas > sellGas){
        sellGas = maxFeePerGas -1;
      }
      let overrides = {
        gasPrice: standardGas *3,
        gasLimit: 150816,
      };
      console.log('amountIn:',amountIn,',maxMultiple:',maxMultiple,',toCoin:',toCoin);
      // const amountIn = 1000000000000000;
      // const maxMultiple = 10;

      if(txInfo.has(transaction.hash)){
        const beforeSendTime = new Date().getTime()/1000;
        // walletWithProvider = new ethers.Wallet(privateKey, officialProvider);
        // wallet2 = new ethers.Wallet(privateKey2, officialProvider);
        sandwichBot.connect(walletWithProvider).buy(amountIn,maxMultiple,toCoin,0,overrides);

        overrides = {
          gasPrice: sellGas,
          gasLimit: 130816,
        };
        sandwichBot.connect(wallet2).sell(toCoin,overrides);
        const afterSendTime = new Date().getTime()/1000;


        console.log('--------------------------------',transaction.hash,'--------------------------------------')
        console.log(
          'beforeQueryTime:',beforeQueryTime,
          'afterQueryTime:',afterQueryTime,
          'beforeSendTime:',beforeSendTime,
          'afterSendTime:',afterSendTime
          )
        lastSendTime = afterSendTime;
      }
    }
  }
 
    
    
    

  


}