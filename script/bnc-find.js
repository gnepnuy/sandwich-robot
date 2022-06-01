// For Node < v13 / CommonJS environments
const BlocknativeSdk = require('bnc-sdk');
const WebSocket = require('ws');
const ethers = require('ethers');
const Router = require('../abi/router.json');
const key = require('../privatekey.json');
const targetCoins = require('../targetCoins.json');



// const routerAddess = "0xcF0feBd3f17CEf5b47b0cD257aCf6025c5BFf3b7";   //bsc-main apeswap
const routerAddess = "0x10ED43C718714eb63d5aA57B78B54704E256024E";   //bsc-main pancake





const bscUrl_official = "https://bsc-dataseed2.binance.org/";

let privateKey = key.key1;

let officialProvider = new ethers.providers.JsonRpcProvider(bscUrl_official);
let walletWithProvider = new ethers.Wallet(privateKey, officialProvider);


let router = new ethers.Contract(routerAddess,Router.abi,walletWithProvider);

// create options object
const options = {
  dappId: 'd3da6c32-5300-4f22-af99-f574da5843fe',
  // dappId: '0d306f4c-3137-4c41-88f9-e618d8c7de98',
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


// 这里定义两个map来记录交易的状态
var txInfo = new Map();
function recordTx(transaction){
    // console.log('current time:',new Date().getTime());
    const currentTime =  new Date().toUTCString();
    if(transaction.status == 'pending'){
        txInfo.set(transaction.hash,transaction);
        for(client of clients){
          client.send(JSON.stringify(transaction));
        }
        console.log('currentTime:',currentTime,' find new pending transaction，hash:',transaction.hash);
    }else{
        if(txInfo.has(transaction.hash)){
            txInfo.delete(transaction.hash);
            //console.log('transaction status is change, remove the transaction.hash:',transaction.hash);
        }
    }
    //console.log('--------------------------------------------------------------------')
}



async function handlerPengdingTx(transaction){

  // const paths = transaction.contractCall.params.path;
  // if(paths.length > 2){
  //   return
  // }
  // // console.log(transaction)
  // //判断是否为目标币种
  // if(targetCoins.coins.join().indexOf(paths[1]) < 0){
  //    // //计算出当前交易的滑点
  //   const amountIn = transaction.value;
  //   //排除小额交易
  //   if(transaction.value < 500000000000000000){
  //     return
  //   }
  //   const amountOut = await router.getAmountsOut(amountIn,paths);//查询当前能换的数量


  //   const expectAmountOut = amountOut[paths.length - 1].toString();//当前能换的数量  
  //   const minAmountOut = transaction.contractCall.params.amountOutMin;//设定的最少能换的数量

  //   const slippage = ((expectAmountOut - minAmountOut) / expectAmountOut) * 100;
  //   console.log('slippage:',slippage,'% ,hash:',transaction.hash)
    
  // }
}


//这里提供一个websocket服务
let WebSocketServer = WebSocket.Server;
let wss = new WebSocketServer({port: 3008});
let clients = [];

wss.on('connection',function(client) {
  console.log('client is connected');
  clients.push(client);


})

