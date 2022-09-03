//SPDX-License-Identifier:UNLICENSED
pragma solidity ^0.8.0;

interface IERC721 {
    function safeTransferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

contract Escrow {
    //Transfer ownership of property
    address public nftAddress;
    uint256 public nftId;
    uint256 public purchasePrice;
    uint256 public escrowAmount;
    address payable seller;
    address payable buyer;
    address public inspector;
    address public lender;
    bool public inspection = false;

    modifier onlyBuyer() {
        require(msg.sender == buyer, "Only buyer is allowed to send earnest");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Only Inspector can inspect");
        _;
    }
    mapping(address => bool) public approval;

    //This is receive is used for a contract to receieve amount
    receive() external payable {}

    constructor(
        address _nftAddress,
        uint256 _nftId,
        uint256 _purchasePrice,
        uint256 _escrowAmount,
        address payable _seller,
        address payable _buyer,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        nftId = _nftId;
        seller = _seller;
        buyer = _buyer;
        purchasePrice = _purchasePrice;
        escrowAmount = _escrowAmount;
        inspector = _inspector;
        lender = _lender;
    }

    function approvalUpdation(address _sender, bool _approve) public {
        approval[_sender] = _approve;
    }

    function updateInspectionStatus(bool _passed) public onlyInspector {
        inspection = _passed;
    }

    function depositEarnest() public payable onlyBuyer {
        require(msg.value >= escrowAmount, "Minimum amount not paid");
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    //A function to Finalize Sale and transfer nft from sellers address to buyer.
    function finalizeSale() public {
        require(inspection, "Inspection not passed");
        require(approval[buyer], "Not approved by buyer");
        require(approval[seller], "Not approved by seller");
        require(approval[lender], "Not approved by lender");
        require(address(this).balance >= purchasePrice, "Not enough Ether");

        (bool success, ) = payable(seller).call{value: address(this).balance}(
            ""
        );
        IERC721(nftAddress).safeTransferFrom(seller, buyer, nftId);
    }
}
