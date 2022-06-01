// SPDX-License-Identifier: MIT

pragma solidity >=0.6.12;

import './PancakeLibrary.sol';
import './IERC20.sol';
import './IPancakePair.sol';
import './UniswapV2Library.sol';
import './ApeLibrary.sol';
import './Operator.sol';


contract SandwichBotV3 is Operator{


  address public factory;

  event Buy(address token,uint256 tokenAmount,uint256 buyAmount);
  event Sell(address token,uint256 tokenAmount,uint256 buyAmount);


  constructor (address _factory,address[] memory _ops) public {
    factory = _factory;
    _addOps(_ops);
  }

  function buy(uint256 amount,address[] memory path,uint256 minOutAmount) external onlyOperator{
    require(amount > 0,'Params error');

    uint256 balance = IERC20(path[0]).balanceOf(address(this));
    require(balance >= amount,'balance not enough');

    uint256[] memory amounts = PancakeLibrary.getAmountsOut(factory, amount, path);
    uint256 pathLength = path.length;
    require(amounts[pathLength-1] > 0,'The pair lack of liquidity');
    if(minOutAmount > 0){
      require(amounts[pathLength-1] >= minOutAmount,'Too much price change');
    }
    
    address pair = PancakeLibrary.pairFor(factory, path[0], path[1]);
    IERC20(path[0]).transfer(pair, amounts[0]);

    _swap(amounts, path,address(this));
    uint256 buyTokenBalance = IERC20(path[pathLength-1]).balanceOf(address(this));
    require(buyTokenBalance >= amounts[pathLength-1],'Not get a good price');
    emit Buy(path[pathLength-1], amounts[pathLength-1], amounts[0]);
  }


  function sell(address[] memory path) external onlyOperator{
    uint256 sellTokenBalance = IERC20(path[0]).balanceOf(address(this));
    require(sellTokenBalance > 0,'The sell token balance is zero');

    uint256[] memory amounts = PancakeLibrary.getAmountsOut(factory, sellTokenBalance, path);
    uint256 pathLength = path.length;

    address pair = PancakeLibrary.pairFor(factory, path[0], path[1]);
    IERC20(path[0]).transfer(pair, sellTokenBalance);

    _swap(amounts,path,address(this));
    emit Sell(path[0], amounts[0], amounts[pathLength-1]);
  }

  function withdraw(address token,uint256 amount) external onlyOwner{
    require(amount > 0,'Why do it?');
    require(token != address(0),'Why do it?');
    require(IERC20(token).balanceOf(address(this)) >= amount,'Balance not enough');
    IERC20(token).transfer(owner(), amount);
  }


   function _swap(uint[] memory amounts, address[] memory path, address _to) internal virtual {
        for (uint i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0,) = PancakeLibrary.sortTokens(input, output);
            uint amountOut = amounts[i + 1];
            (uint amount0Out, uint amount1Out) = input == token0 ? (uint(0), amountOut) : (amountOut, uint(0));
            address to = i < path.length - 2 ? PancakeLibrary.pairFor(factory, output, path[i + 2]) : _to;
            IPancakePair(PancakeLibrary.pairFor(factory, input, output)).swap(
                amount0Out, amount1Out, to, new bytes(0)
            );
        }
    }

}