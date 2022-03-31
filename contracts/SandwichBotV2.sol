// SPDX-License-Identifier: MIT

pragma solidity >=0.6.12;

import './PancakeLibrary.sol';
import './IERC20.sol';
import './IPancakePair.sol';
import './UniswapV2Library.sol';
import './ApeLibrary.sol';
import './Operator.sol';


contract SandwichBotV2 is Operator{


  address public wbnb;
  address public factory;

  event Buy(address token,uint256 tokenAmount,uint256 bnbAmount);
  event Sell(address token,uint256 tokenAmount,uint256 bnbAmount);


  constructor (address _wbnb,address _factory,address[] memory _ops) public {
    wbnb = _wbnb;
    factory = _factory;
    _addOps(_ops);
  }



  function buy(uint256 amount,uint256 multiple ,address buyToken,uint256 minOutAmount) external onlyOperator{
    require(amount > 0 && multiple >= 1,'Params error');
    require(buyToken != wbnb && buyToken != address(0),'Params error');

    amount = amount * multiple;
    uint256 wbnbBalance = IERC20(wbnb).balanceOf(address(this));
    require(wbnbBalance >= amount,'wbnb balance not enough');

    address[] memory path = new address[](2);
    path[0] = wbnb;
    path[1] = buyToken;
    uint256[] memory amounts = PancakeLibrary.getAmountsOut(factory, amount, path);
    require(amounts[1] > 0,'The pair lack of liquidity');
    if(minOutAmount > 0){
      require(amounts[1] >= minOutAmount,'Too much price change');
    }
    
    _swap(path, amounts);
    uint256 buyTokenBalance = IERC20(buyToken).balanceOf(address(this));
    require(buyTokenBalance >= amounts[1],'Not get a good price');
    emit Buy(buyToken, amounts[1], amounts[0]);
  }

  function sell(address sellToken) external onlyOperator{
    uint256 sellTokenBalance = IERC20(sellToken).balanceOf(address(this));
    require(sellTokenBalance > 0,'The sell token balance is zero');
    address[] memory path = new address[](2);
    path[0] = sellToken;
    path[1] = wbnb;
    uint256[] memory amounts = PancakeLibrary.getAmountsOut(factory, sellTokenBalance, path);
    _swap(path,amounts);
    emit Sell(sellToken, amounts[0], amounts[1]);
  }

  function withdraw(address token,uint256 amount) external onlyOwner{
    require(amount > 0,'Why do it?');
    require(token != address(0),'Why do it?');
    require(IERC20(token).balanceOf(address(this)) >= amount,'Balance not enough');
    IERC20(token).transfer(owner(), amount);
  }


  function _swap(address[] memory path,uint256[] memory amounts) internal {
    address pair = PancakeLibrary.pairFor(factory, path[0], path[1]);

    IERC20(path[0]).transfer(pair, amounts[0]);
    (address token0,) = PancakeLibrary.sortTokens(path[0], path[1]);
    (uint256 amount0Out, uint256 amount1Out) = token0 == path[0] ? (uint(0),amounts[1]) : (amounts[1],uint(0));

    IPancakePair(pair).swap(amount0Out, amount1Out, address(this), new bytes(0));
  }

}