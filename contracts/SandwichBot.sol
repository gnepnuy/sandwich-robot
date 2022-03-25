// SPDX-License-Identifier: MIT

pragma solidity >=0.6.12;

import './PancakeLibrary.sol';
import './IERC20.sol';
import './IPancakePair.sol';
import './UniswapV2Library.sol';
import './ApeLibrary.sol';
import './Operator.sol';


contract SandwichBot is Operator{


  address public wbnb;
  address public factory;


  constructor (address _wbnb,address _factory,address[] memory _ops) public {
    wbnb = _wbnb;
    factory = _factory;
    _addOps(_ops);
  }



  function buy(uint256 amount,uint256 multiple ,address buyToken) external onlyOperator{
    require(amount > 0 && multiple >= 1,'Params error');
    require(buyToken != wbnb && buyToken != address(0),'Params error');

    amount = amount * multiple;
    uint256 wbnbBalance = IERC20(wbnb).balanceOf(address(this))/2;
    amount = wbnbBalance < amount ? wbnbBalance : amount;
    address[] memory path = new address[](2);
    path[0] = wbnb;
    path[1] = buyToken;
    uint256[] memory amounts = ApeLibrary.getAmountsOut(factory, amount, path);
    require(amounts[1] > 0,'The pair lack of liquidity');
    _swap(path, amounts);
    uint256 buyTokenBalance = IERC20(buyToken).balanceOf(address(this));
    require(buyTokenBalance >= amounts[1],'Not get a good price');
  }

  function sell(address sellToken) external onlyOperator{
    uint256 sellTokenBalance = IERC20(sellToken).balanceOf(address(this));
    require(sellTokenBalance > 0,'The sell token balance is zero');
    address[] memory path = new address[](2);
    path[0] = sellToken;
    path[1] = wbnb;
    uint256[] memory amounts = ApeLibrary.getAmountsOut(factory, sellTokenBalance, path);
    _swap(path,amounts);
  }

  function withdraw(address token,uint256 amount) external onlyOwner{
    require(amount > 0,'Why do it?');
    require(token != address(0),'Why do it?');
    require(IERC20(token).balanceOf(address(this)) >= amount,'Balance not enough');
    IERC20(token).transfer(owner(), amount);
  }

  function _swap(address[] memory path,uint256[] memory amounts) internal {
    address pair = ApeLibrary.pairFor(factory, path[0], path[1]);

    IERC20(path[0]).transfer(pair, amounts[0]);
    (address token0,) = ApeLibrary.sortTokens(path[0], path[1]);
    (uint256 amount0Out, uint256 amount1Out) = token0 == path[0] ? (uint(0),amounts[1]) : (amounts[1],uint(0));

    IPancakePair(pair).swap(amount0Out, amount1Out, address(this), new bytes(0));
  }

}