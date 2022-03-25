// SPDX-License-Identifier: MIT

pragma solidity >=0.6.12;

import './EnumerableSet.sol';
import './Ownable.sol';

contract Operator is Ownable{

  using EnumerableSet for EnumerableSet.AddressSet;

  EnumerableSet.AddressSet private operators;

  modifier onlyOperator{
    require(operators.contains(_msgSender()),'Only operator');
    _;
  }

  function setOperators(address[] memory ops) external onlyOwner{
    _addOps(ops);
  }

  function removeOperators(address[] memory ops)external onlyOwner{
    for(uint256 i;i < ops.length;i++){
      operators.remove(ops[i]);
    }
  }

  function getOperators(uint256 index) external view returns (address){
    return operators.at(index);
  }

  function operatorContains(address operator)external view returns(bool){
    return operators.contains(operator);
  }

  function _addOps(address[] memory ops) internal{
    for(uint256 i;i < ops.length;i++){
      operators.add(ops[i]);
    }
  }

}