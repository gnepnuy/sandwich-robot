// For Node < v13 / CommonJS environments
const BlocknativeSdk = require('bnc-sdk');
const WebSocket = require('ws');


const address = "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8";

// create options object
const options = {
  dappId: 'd3da6c32-5300-4f22-af99-f574da5843fe',
  networkId: 56,
  transactionHandlers: [event => handlerTx(event.transaction)],
  ws: WebSocket,
  onerror: (error) => {console.log(error)}
}

// initialize and connect to the api
const blocknative = new BlocknativeSdk(options)

blocknative.configuration({
    scope: address, // [required] - either 'global' or valid Ethereum address
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
  } = blocknative.account(address)

const targetCoin = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';//busd

  // register a callback for a txPool event
emitter.on("txPool", transaction => {
    console.log('current time:',new Date().getTime());
    console.log("Transaction is pending:",JSON.stringify(transaction))
    console.log('--------------------------------------------------------------------')
    //设置夹取的pair=>bnb-busd
    const paths = transaction.contractCall.params.path;
    console.log('===================path:',paths);
    //console.log('paths-length:',paths.length);
    const toCoin = paths[paths.length-1];
    console.log('========================>',toCoin);
    if(targetCoin != toCoin){
        return;
    }
    console.log('return is not active')
    //计算出当前交易的滑点

    //计算出盈利空间

    //组装交易

    //发送交易

})


// 这里定义两个map来记录交易的状态
var txInfo = new Map();
function handlerTx(transaction){
    console.log('current time:',new Date().getTime());
    if(transaction.status == 'pending'){
        txInfo.set(transaction.hash,transaction);
        console.log('find new pending transaction，hash:',transaction.hash);
    }else{
        if(txInfo.has(transaction.hash)){
            txInfo.delete(transaction.hash);
            console.log('transaction status is change, remove the transaction.hash:',transaction.hash);
        }
    }
    console.log('--------------------------------------------------------------------')
}