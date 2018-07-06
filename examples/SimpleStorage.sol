pragma experimental ABIEncoderV2;
pragma solidity ^0.4.0;

contract SimpleStorage {
    uint storedData;

    struct SimpleStruct {
        uint x;
        uint y;
    }

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

    function setStructX(uint256 dank, SimpleStruct x) public returns (uint256) {
        storedData = x.x;
        return x.x;
    }

    function setStructY(uint256 memes, SimpleStruct x) public returns (uint256) {
        storedData = x.y;
        return x.y;
    }

    function get() public view returns (uint) {
        return storedData;
    }
}
