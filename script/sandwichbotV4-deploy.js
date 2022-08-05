const { ethers } = require("hardhat");

async function main() {
    const SandwichBotV4 = await ethers.getContractFactory("SandwichBotV4");
    
    //Start deployment, returning a promise that resolves to a contract object

    // //bsc-main-pancake
    // const wbnb = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';
    // const factory = '0xca143ce32fe78f1f7019d7d551a6402fc5350c73';
    // const ops = ['0xdaD6Ce241e4fd75e03d90a2E54478CA87382AA7d','0xeF7531B7cA509813F097992bf7baE6e55CE0f4a4','0xe47FB8F59aBC474b2Aa2FA445c716399C9dB37Db'];

     //bsc-test-apeswap
    //  const wbnb = '0xae13d989dac2f0debff460ac112a837c89baa7cd';
    // busd 0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7
     const factory = '0x152349604d49c2af10adee94b918b051104a143e';
     const ops = ['0xb6716f387FD3C51C08FdE91F6f63AFbF4932d869','0xaba6b39018DDCFF3B47B7599462E1be3F91dcf2E','0xcA34a7A33fcbBeA790B465D8DFa261dC169C6743']; //test ops
    // const ops = ["0x667010fa277c8920a811a596960e1ba3603F625A",
    //             "0xB11Aa4bE5337F22DB0e8ACF2b1E96D7DCfb087b0",
    //             "0x1BA0eCC0A8D8704278CbE778B6F939FDC71318ED",
    //             "0x16Dad7fec78782f8A457B249c0063d8058314F85",
    //             "0x7ADBeeFfc9Ad965B5846652fFaA068C99F919c37",
    //             "0x19A4B4B804D123Efd5f47db3A26a98c19E1a90e5",
    //             "0x818c052C49F1314904504cdEfC5C7B46840E55dF",
    //             "0xd6e6bf10B78aFBbeF4d389EB04051AF065460F62",
    //             "0x0D7B9f817118E26392C3086276e2E82267730E26",
    //             "0x1A8dC96EfBb0b302Ab054606fdD6F858D5cb9EE7"] //main ops


    // ["0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd","0x4Fb99590cA95fc3255D9fA66a1cA46c43C34b09a"]  test buy args

    // ["0x4Fb99590cA95fc3255D9fA66a1cA46c43C34b09a","0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"]  test sell args


    const sandwichBotV4 = await SandwichBotV4.deploy(factory,ops);
    console.log("sandwichBot Contract deployed to address:", sandwichBotV4.address);
 }
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });