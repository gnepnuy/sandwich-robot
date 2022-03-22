pragma solidity ^0.8.0;

import './PancakeLibrary.sol';
import './IERC20.sol';


contract SandwichBot {

  //using SafeMath for uint256;

  address wbnb;
  address factory;

  constructor(address _wbnb,address _factory){
    wbnb = _wbnb;
    factory = _factory;
  }


  function buy(uint256 amount,uint256 multiple ,address buyToken) public{
    //先拿到pair
    address pair = PancakeLibrary.pairFor(factory, wbnb, buyToken);
    //计算购买量
    amount = amount * multiple;
    uint256 wbnbBalance = IERC20(wbnb).balanceOf(this)/2;
    if(wbnbBalance < amount){
      amount = wbnbBalance;
    }

    //把wbnb转到pair合约

    //计算购买量
    // address[] path = new 
    // uint256[] amounts = PancakeLibrary.getAmountsOut(factory, amount, path);





  }

  function sell(address sellToken) public{

  }


}