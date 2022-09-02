const { expect } = require('chai');
const { ethers } = require('hardhat');

//Function to convert ether to wei
const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether');
}

const ether = tokens;

describe("RealEstate", () => {
    let realEstate, escrow;
    let deployer, seller, buyer, inspector, lender;
    let nftID = 1;
    let purchasePrice = ether(100);
    let escrowAmount = ether(20);
    beforeEach(async () => {
        //Setup Accounts
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        buyer = accounts[1];
        inspector = accounts[2];
        lender = accounts[3];
        seller = deployer;
        //Load Contracts
        const RealEstate = await ethers.getContractFactory('RealEstate');
        const Escrow = await ethers.getContractFactory('Escrow');

        //Deploy Contracts
        realEstate = await RealEstate.deploy();
        escrow = await Escrow.deploy(
            realEstate.address,
            nftID,
            purchasePrice,
            escrowAmount, //20% downpayment for Escrow
            seller.address,
            buyer.address,
            inspector.address,
            lender.address,
        );

        //Seller Approves NFT
        transaction = await realEstate.connect(seller).approve(escrow.address, nftID)
        await transaction.wait()
    })

    describe('Deployment', async () => {
        it('sends an NFT to the seller / deployer', async () => {
            expect(await realEstate.ownerOf(nftID)).to.equal(seller.address)
        })
    })

    describe('Selling real estate', async () => {
        let balance, transaction;
        it('executes a successful transaction ', async () => {
            //Expect seller to be the NFT owner before the sale
            expect(await realEstate.ownerOf(nftID)).to.equal(seller.address)

            //Check escrow balance
            balance = await escrow.getBalance();
            console.log("escrow balance:", ethers.utils.formatEther(balance))

            //Buyer Deposit to Earnest
            transaction = await escrow.connect(buyer).depositEarnest({ value: escrowAmount });
            console.log("buyer deposits earnest money");

            //Check escrow balance
            balance = await escrow.getBalance();
            console.log("escrow balance:", ethers.utils.formatEther(balance))

            // //Inspector update status
            // transaction=await escrow.connect(inspector).updteInspectionStatus(true);
            // await transaction.wait();
            // console.log("Inspector updates status");

            //finalize sale
            transaction = await escrow.connect(buyer).finalizeSale()
            await transaction.wait();
            console.log("buyer finalize sale");

            //Expect the buyer to be the NFT owner after the sale
            expect(await realEstate.ownerOf(nftID)).to.equal(buyer.address)
        })
    })
})