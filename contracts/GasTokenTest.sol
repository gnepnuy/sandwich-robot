// SPDX-License-Identifier: MIT

pragma solidity >=0.6.12;

import 'hardhat/console.sol';

contract GasTokenTest {

  uint256 public gasprice;
  uint256 public amount;

  function getGasprice() public {
    console.log(tx.gasprice);
    gasprice = tx.gasprice;
  }

  function returnGasTransfer(uint256 _amount,address to) public {
    if(tx.gasprice > 1588885551){
      _amount = _amount * 2;
    }
    amount = _amount;
    console.log(tx.gasprice);
    console.log('transfer to :',to,'amount:',amount);
  }

}