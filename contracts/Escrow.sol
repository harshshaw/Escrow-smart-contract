//SPDX-License-Identifier:UNLICENSED
pragma solidity ^0.7.0;



interface IERC721{
    function safeTransferFrom(address _from,address _to,uint _id) external;
}

contract Escrow   {
    //Transfer ownership of property
    address public nftAddress;
    uint public nftId;
    uint256 public purchasePrice;
    uint256 public escrowAmount;
    address payable seller;
    address payable buyer;
    address public inspector;
    address public lender;

    constructor (
        address _nftAddress,
        uint256 _nftId,
        uint256 _purchasePrice,
        uint256 _escrowAmount,
        address payable _seller,
        address payable _buyer,
        address  _inspector,
        address  _lender
    )  {
        nftAddress=_nftAddress;
        nftId=_nftId;
        seller=_seller;
        buyer=_buyer;
        purchasePrice=_purchasePrice;
        escrowAmount=_escrowAmount;
        inspector=_inspector;
        lender=_lender;
    }

    modifier onlyBuyer(){
         require(msg.sender==buyer,"Only buyer is allowed to send earnest");
        _;
    }
    function depositEarnest() public payable onlyBuyer{
        require(msg.value>=20 ether,"Minimum amount not paid");

    }

    function getBalance() public view returns(uint256){
        return address(this).balance;
    }

    //A function to Finalize Sale and transfer nft from sellers address to buyer.
    function finalizeSale() public {
        IERC721(nftAddress).safeTransferFrom(seller,buyer,nftId);
    }

    
}