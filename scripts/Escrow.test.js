const {expect}=require('chai');
const {ethers}=require('hardhat');

describe("RealEstate",()=>{
    let realEstate,escrow;
    let deployer,seller,buyer;
    let nftID=1;
    beforeEach(async()=>{
        //Setup Accounts
        accounts=await ethers.getSigners();
        deployer=accounts[0];
        buyer=accounts[1];
        seller=deployer;
        //Load Contracts
        const RealEstate=await ethers.getContractFactory('RealEstate');
        const Escrow=await ethers.getContractFactory('Escrow');

        //Deploy Contracts
        realEstate=await RealEstate.deploy();
        escrow=await Escrow.deploy(
            realEstate.address,
            nftID,
            seller.address,
            buyer.address
        );

        //Seller Approves NFT
        transaction=await realEstate.connect(seller).approve(escrow.address,nftID)
        await transaction.wait()
    })

    describe('Deployment',async()=>{
        it('sends an NFT to the seller / deployer', async()=>{
            expect(await realEstate.ownerOf(nftID)).to.equal(seller.address)
        })
    })

    describe('Selling real estate',async()=>{
        it('executes a successful transaction ' async()=>{
            //Expect seller to be the NFT owner before the sale
            expect(await realEstate.ownerOf(nftID)).to.equal(seller.address)

            //finalize sale
            transaction=await escrow.connect(buyer).finalizeSale()
            await transaction.wait()
            console.log("buyer finalize sale")

            //Expect the buyer to be the NFT owner after the sale
            expect(await realEstate.ownerOf(nftID)).to.equal(buyer.address)
        })
    })
})