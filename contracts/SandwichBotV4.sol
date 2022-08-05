// SPDX-License-Identifier: MIT

pragma solidity >=0.6.12;

import './PancakeLibrary.sol';
import './IERC20.sol';
import './IPancakePair.sol';
import './UniswapV2Library.sol';
import './ApeLibrary.sol';
import './Operator.sol';
import './Gas.sol';


contract SandwichBotV4 is Operator{


  address public factory;

  uint256 public totalMinted;
  uint256 public totalBurned;




  constructor (address _factory,address[] memory _ops) public {
    factory = _factory;
    _addOps(_ops);
  }



  function mint(uint256 value) public {
    uint256 offset = totalMinted;
    assembly {
      
      // mstore(0, 0x746d4946c0e9F43F4Dee607b0eF1fA1c3318585733ff6000526015600bf30000) 原来的bytecode
      // 部署后会生成的合约地址 0xe22b4328d29334cc1aeaea5fa55cb4f2c2cb33c7  
      //  0xd9dff9921b827250ec861d5ac8ecceb404c06f2f
      // 0xb08907a05f799f4fbc349cbac5cd46b99bbd52f6
      // 0xefdc71fa16bd79c4b9311c30c18e0ea045c822a9
      // 0x23d797ee350ff957b20fee29795fc02671549b14
      // 0x75df95d3d62aa0ce31a5c07c06be31fa5f7f14fe
      // 0x5799990c2ce243f2acd13a317225fa4910ed6747
      // 0xceeeae2a6f41bf61a11913f8b985df425ce27cb7
      // 根据部署后会生成的合约地址得到的 initcode: 0x7a73ceeeae2a6f41bf61a11913f8b985df425ce27cb73318585733ff600052601b6005f30000

      mstore(0, 0x7a73ceeeae2a6f41bf61a11913f8b985df425ce27cb73318585733ff60005260)
      mstore(32, 0x1b6005f300000000000000000000000000000000000000000000000000000000)

      for {let i := div(value, 32)} i {i := sub(i, 1)} {
        pop(create2(0, 0, 36, add(offset, 0))) pop(create2(0, 0, 36, add(offset, 1)))
        pop(create2(0, 0, 36, add(offset, 2))) pop(create2(0, 0, 36, add(offset, 3)))
        pop(create2(0, 0, 36, add(offset, 4))) pop(create2(0, 0, 36, add(offset, 5)))
        pop(create2(0, 0, 36, add(offset, 6))) pop(create2(0, 0, 36, add(offset, 7)))
        pop(create2(0, 0, 36, add(offset, 8))) pop(create2(0, 0, 36, add(offset, 9)))
        pop(create2(0, 0, 36, add(offset, 10))) pop(create2(0, 0, 36, add(offset, 11)))
        pop(create2(0, 0, 36, add(offset, 12))) pop(create2(0, 0, 36, add(offset, 13)))
        pop(create2(0, 0, 36, add(offset, 14))) pop(create2(0, 0, 36, add(offset, 15)))
        pop(create2(0, 0, 36, add(offset, 16))) pop(create2(0, 0, 36, add(offset, 17)))
        pop(create2(0, 0, 36, add(offset, 18))) pop(create2(0, 0, 36, add(offset, 19)))
        pop(create2(0, 0, 36, add(offset, 20))) pop(create2(0, 0, 36, add(offset, 21)))
        pop(create2(0, 0, 36, add(offset, 22))) pop(create2(0, 0, 36, add(offset, 23)))
        pop(create2(0, 0, 36, add(offset, 24))) pop(create2(0, 0, 36, add(offset, 25)))
        pop(create2(0, 0, 36, add(offset, 26))) pop(create2(0, 0, 36, add(offset, 27)))
        pop(create2(0, 0, 36, add(offset, 28))) pop(create2(0, 0, 36, add(offset, 29)))
        pop(create2(0, 0, 36, add(offset, 30))) pop(create2(0, 0, 36, add(offset, 31)))
        offset := add(offset, 32)
      }

      for {let i := and(value, 0x1F)} i {i := sub(i, 1)} {
        pop(create2(0, 0, 36, offset))
        offset := add(offset, 1)
      }
    }

    totalMinted = offset;
  }

  function computeAddress2(uint256 salt) public view returns (address) {
    bytes32 _data = keccak256(
      abi.encodePacked(bytes1(0xff), address(this), salt, bytes32(0xece765a5056ac3e8dff45bb0f8d34e87127462b575f8283407d51ebf96fd0280))
    );
    return address(uint256(_data));
  }

  function _destroyChildren(uint256 value) internal {
    uint256 _totalBurned = totalBurned;
    for (uint256 i = 0; i < value; i++) {
      computeAddress2(_totalBurned + i).call("");
    }
    totalBurned = _totalBurned + value;
  }

  function buy(uint256 amount,address[] memory path,uint256 minOutAmount) external onlyOperator{
    // if(tx.gasprice > 10){
      _destroyChildren(4);
    // }
    

    require(amount > 0,'Params error');

    uint256 balance = IERC20(path[0]).balanceOf(address(this));
    require(balance >= amount,'balance not enough');
    uint256[] memory amounts = ApeLibrary.getAmountsOut(factory, amount, path);
    uint256 pathLength = path.length;
    require(amounts[pathLength-1] > 0,'The pair lack of liquidity');
    if(minOutAmount > 0){
      require(amounts[pathLength-1] >= minOutAmount,'Too much price change');
    }
    
    IERC20(path[0]).transfer(ApeLibrary.pairFor(factory, path[0], path[1]), amounts[0]);
    
    _swap(amounts, path,address(this));
    uint256 buyTokenBalance = IERC20(path[pathLength-1]).balanceOf(address(this));
    require(buyTokenBalance >= amounts[pathLength-1],'Not get a good price');
  }


  function sell(address[] memory path) external onlyOperator{
    // if(tx.gasprice > 10){
      _destroyChildren(2);
    // }
    uint256 sellTokenBalance = IERC20(path[0]).balanceOf(address(this));
    require(sellTokenBalance > 0,'The sell token balance is zero');

    uint256[] memory amounts = ApeLibrary.getAmountsOut(factory, sellTokenBalance, path);
    IERC20(path[0]).transfer(ApeLibrary.pairFor(factory, path[0], path[1]), sellTokenBalance);
    
    _swap(amounts,path,address(this));
  }

  function withdraw(address token,uint256 amount) external onlyOwner{
    require(amount > 0,'Why do it?');
    require(token != address(0),'Why do it?');
    require(IERC20(token).balanceOf(address(this)) >= amount,'Balance not enough');
    IERC20(token).transfer(owner(), amount);
  }


   function _swap(uint[] memory amounts, address[] memory path, address _to) internal {
        for (uint i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0,) = ApeLibrary.sortTokens(input, output);
            uint amountOut = amounts[i + 1];
            (uint amount0Out, uint amount1Out) = input == token0 ? (uint(0), amountOut) : (amountOut, uint(0));
            address to = i < path.length - 2 ? ApeLibrary.pairFor(factory, output, path[i + 2]) : _to;
            IPancakePair(ApeLibrary.pairFor(factory, input, output)).swap(
                amount0Out, amount1Out, to, new bytes(0)
            );
        }
    }

}