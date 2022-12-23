const { expect } = require("chai")
const { ethers } = require("hardhat")
const { utils, constants } = require("ethers")

describe("MinSendAmountOFT", () => {
    const localChainId = 1
    const remoteChainId = 2

    const nativeFee = utils.parseEther("0.1")
    const minAmount = utils.parseEther("1")
    const initialSupply = utils.parseEther("100")

    const name = "OFT"
    const symbol = "OFT"

    let owner, user, ownerAddressBytes32
    let localEndpoint, remoteEndpoint
    let localOft, remoteOft

    before(async () => {
        [owner, user] = await ethers.getSigners()
        ownerAddressBytes32 = utils.solidityPack(["address"], [owner.address])
    })

    beforeEach(async () => {
        const endpointFactory = await ethers.getContractFactory("LZEndpointMock")
        const minSendAmountOftFactory = await ethers.getContractFactory("MintableMinSendAmountOFTMock")
        const oftFactory = await ethers.getContractFactory("OFT")

        localEndpoint = await endpointFactory.deploy(localChainId)
        remoteEndpoint = await endpointFactory.deploy(remoteChainId)

        localOft = await minSendAmountOftFactory.deploy(name, symbol, localEndpoint.address, minAmount)
        remoteOft = await oftFactory.deploy(name, symbol, remoteEndpoint.address)

        // internal bookkeeping for endpoints (not part of a real deploy, just for this test)
        await localEndpoint.setDestLzEndpoint(remoteOft.address, remoteEndpoint.address)
        await remoteEndpoint.setDestLzEndpoint(localOft.address, localEndpoint.address)

        await localOft.setTrustedRemoteAddress(remoteChainId, remoteOft.address)
        await remoteOft.setTrustedRemoteAddress(localChainId, localOft.address)

        await localOft.mint(owner.address, initialSupply)
    })

    it("reverts when the amount sent is less than minimum allowed", async () => {
        await expect(
            localOft.sendFrom(
                owner.address,
                remoteChainId,
                ownerAddressBytes32,
                utils.parseEther("0.9"),
                owner.address,
                constants.AddressZero,
                "0x",
                { value: nativeFee }
            )
        ).to.be.revertedWith("MinSendAmountOFT: amount is less than minimum")
    })

    it("sends the amount greater or equal to the minimum allowed", async () => {
        const sendAmount = minAmount
        await localOft.sendFrom(owner.address, remoteChainId, ownerAddressBytes32, sendAmount, owner.address, constants.AddressZero, "0x", { value: nativeFee })
        expect(await localOft.balanceOf(owner.address)).to.eq(initialSupply.sub(sendAmount))
        expect(await remoteOft.balanceOf(owner.address)).to.eq(sendAmount)
    })

    it("sets minSendAmount when called by the owner", async () => {
        const newMinAmount = utils.parseEther("2")
        await localOft.setMinSendAmount(newMinAmount)
        expect(await localOft.minSendAmount()).to.eq(newMinAmount)
    })

    it("reverts when a non-owner calls setMinSendAmount", async () => {
        await expect(localOft.connect(user).setMinSendAmount(utils.parseEther("2"))).to.be.revertedWith("Ownable: caller is not the owner")
    })
})