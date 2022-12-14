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
            expect(await realEstate.ownerOf(nftID)).to.equal(seller.address);

            //Check escrow balance
            balance = await escrow.getBalance();
            console.log("escrow balance:", ethers.utils.formatEther(balance));

            //Buyer Deposit to Earnest
            transaction = await escrow.connect(buyer).depositEarnest({ value: escrowAmount });
            console.log("buyer deposits earnest money");

            //Check escrow balance
            balance = await escrow.getBalance();
            console.log("escrow balance:", ethers.utils.formatEther(balance));

            //Inspector update status
            transaction = await escrow.connect(inspector).updateInspectionStatus(true);
            await transaction.wait();
            console.log("Inspector updates status");

            //Approval for Lender, Buyer, Seller
            transaction = await escrow.connect(buyer).approvalUpdation(buyer.address, true);
            await transaction.wait();
            console.log("buyer approved");

            transaction = await escrow.connect(seller).approvalUpdation(seller.address, true);
            await transaction.wait();
            console.log("seller approved");

            //lender sends the Amount to Escrow
            transaction = await lender.sendTransaction({ to: escrow.address, value: ether(80) });
            await transaction.wait();
            console.log("lender has sent the remaining 80% amount");

            transaction = await escrow.connect(lender).approvalUpdation(lender.address, true);
            await transaction.wait();
            console.log("buyer approved");

            //finalize sale
            transaction = await escrow.connect(buyer).finalizeSale();
            await transaction.wait();
            console.log("buyer finalize sale");

            //Expect the buyer to be the NFT owner after the sale
            expect(await realEstate.ownerOf(nftID)).to.equal(buyer.address);

            //Expect Seller to recieve funds
            balance = await ethers.provider.getBalance(seller.address);
            console.log("Seller balance", ethers.utils.formatEther(balance));
            expect(balance).to.be.above(ether(10099));

        })
    })
})