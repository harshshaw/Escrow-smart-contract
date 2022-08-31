//SPDX-License-Identifier:UNLICENSED
pragma solidity ^0.7.0;



interface IERC721{
    function safeTransferFrom(address _from,address _to,uint _id) external;
}

contract Escrow   {
    //Transfer ownership of property
    address public nftAddress;
    uint public nftId;
    address payable seller;
    address payable buyer;

    constructor (
        address _nftAddress,
        uint256 _nftId,
        address payable _seller,
        address payable _buyer
    )  {
        nftAddress=_nftAddress;
        nftId=_nftId;
        seller=_seller;
        buyer=_buyer;
    }

    function finalizeSale() public {
        IERC721(nftAddress).safeTransferFrom(seller,buyer,nftId);
    }

    
}