// For Node < v13 / CommonJS environments
const BlocknativeSdk = require('bnc-sdk');
const WebSocket = require('ws');
const ethers = require('ethers');

const router = require('../abi/router.json');







const address = "0x3a6d8cA21D1CF76F653A67577FA0D27453350dD8";   //biswap router
// const address = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; //pancakeswap router


let url = "https://bsc-dataseed1.defibit.io/";//bsc-main
let customHttpProvider = new ethers.providers.JsonRpcProvider(url);
let contract = new ethers.Contract(address, router.abi, customHttpProvider);

let privateKey = "093b45d7137264e77035c11ce3f55a6c299a80dea1129a19cd38a491c8cf87da";

let walletWithProvider = new ethers.Wallet(privateKey, customHttpProvider);

// create options object
const options = {
  dappId: 'd3da6c32-5300-4f22-af99-f574da5843fe',
  networkId: 56,
  transactionHandlers: [event => recordTx(event.transaction)],
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

// const targetCoin = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';//busd
const targetCoin = '0x965F527D9159dCe6288a2219DB51fc6Eef120dD1';//bsw
const wbnb = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';

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
  console.log('current time:',new Date().getTime());
  //console.log("Transaction is pending:",JSON.stringify(transaction))
  console.log('--------------------------------------------------------------------')
  //设置夹取的pair=>bnb-busd
  const paths = transaction.contractCall.params.path;
  console.log('===================path:',paths);
  //console.log('paths-length:',paths.length);
  const toCoin = paths[paths.length-1];
  console.log('========================>',toCoin);
  // if(targetCoin != toCoin){
  //     return;
  // }
  console.log('hash:',transaction.hash);
  console.log('find target coin transaction !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')

  //计算出当前交易的滑点
  const amountIn = transaction.value;

  const amountOut = await contract.getAmountsOut(amountIn,paths);//查询当前能换的数量
  const expectAmountOut = amountOut[paths.length - 1].toString();//当前能换的数量
  const minAmountOut = transaction.contractCall.params.amountOutMin;//设定的最少能换的数量

  const slippage = ((expectAmountOut - minAmountOut) / expectAmountOut) * 1000;

  // console.log('expect amountOut:',expectAmountOut.toString());
  // console.log('min    amountOut:',transaction.contractCall.params.amountOutMin);
  console.log('slippage:',slippage,'%');
  if(slippage < 5){
    return;//滑点小于5时，放过
  }
  //计算出盈利空间
    //这里直接使用目标交易的数量和滑点的大小来确定我们要使用的资金量
  const maxMultiple = (slippage/0.5) - 2;//最大倍数减去2，试试
  const useAmount = amountIn * maxMultiple;//用多少bnb去夹
  const balance = await walletWithProvider.getBalance()/2;//账户bnb余额,这里除以是为了不要使用所有的资金在一笔交易上
  if(useAmount > balance){
    useAmount = balance;
  }
  
  //组装交易
  let walletContract = contract.connect(walletWithProvider);
  let overrides = {
    gasPrice: utils.parseUnits('9.0', 'gwei'),
    nonce: 123,
    value: useAmount,
  };
  walletContract.swapExactETHForTokens();


  //发送交易
}