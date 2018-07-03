pragma solidity ^0.4.0;

contract SimpleStorage {
    uint storedData;

    constructor(uint256 initData) public {
    	storedData = initData;
    }

    function set(uint x) public {
        storedData = x;
    }

    function setFirst(uint[] x) public returns (uint256) {
        require(x.length > 0);
        storedData = x[0];
        return x[0];
    }

    function get() public view returns (uint) {
        return storedData;
    }
}
