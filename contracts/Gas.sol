// SPDX-License-Identifier: MIT

pragma solidity >=0.6.12;

contract Gas {
  address immutable owner;


  constructor () public {
    address _msgSenfer =  msg.sender;
    owner = _msgSenfer;
  }


  function destroy() public {
    address _owner = owner;
    if(msg.sender == _owner){
      selfdestruct(payable(_owner));
    }
  }
}