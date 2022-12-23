const { expect } = require("chai")
const { ethers } = require("hardhat")
const { utils, constants } = require("ethers")

describe("MinSendAmountNativeOFT", () => {
    const localChainId = 1
    const remoteChainId = 2

    const nativeFee = utils.parseEther("0.1")
    const minAmount = utils.parseEther("1")
    const initialSupply = utils.parseEther("1")

    const name = "OFT"
    const symbol = "OFT"

    let owner, user, ownerAddressBytes32
    let localEndpoint, remoteEndpoint
    let localNativeOft, remoteOft

    before(async () => {
        [owner, user] = await ethers.getSigners()
        ownerAddressBytes32 = utils.solidityPack(["address"], [owner.address])
    })

    beforeEach(async () => {
        const endpointFactory = await ethers.getContractFactory("LZEndpointMock")
        const minSendAmountNativeOftFactory = await ethers.getContractFactory("MinSendAmountNativeOFT")
        const oftFactory = await ethers.getContractFactory("OFT")

        localEndpoint = await endpointFactory.deploy(localChainId)
        remoteEndpoint = await endpointFactory.deploy(remoteChainId)

        localNativeOft = await minSendAmountNativeOftFactory.deploy(name, symbol, localEndpoint.address, minAmount)
        remoteOft = await oftFactory.deploy(name, symbol, remoteEndpoint.address)

        // internal bookkeeping for endpoints (not part of a real deploy, just for this test)
        await localEndpoint.setDestLzEndpoint(remoteOft.address, remoteEndpoint.address)
        await remoteEndpoint.setDestLzEndpoint(localNativeOft.address, localEndpoint.address)

        await localNativeOft.setTrustedRemoteAddress(remoteChainId, remoteOft.address)
        await remoteOft.setTrustedRemoteAddress(localChainId, localNativeOft.address)

        await localNativeOft.deposit({ value: initialSupply })
    })

    it("reverts when the amount sent is less than minimum allowed", async () => {
        await expect(
            localNativeOft.sendFrom(owner.address, remoteChainId, ownerAddressBytes32, utils.parseEther("0.9"), owner.address, constants.AddressZero, "0x", { value: nativeFee })
        ).to.be.revertedWith("MinSendAmountNativeOFT: amount is less than minimum")
    })

    it("sends the amount greater or equal to the minimum allowed", async () => {
        const sendAmount = minAmount
        await localNativeOft.sendFrom(
            owner.address,
            remoteChainId,
            ownerAddressBytes32,
            sendAmount,
            owner.address,
            constants.AddressZero,
            "0x",
            { value: nativeFee }
        )
        expect(await localNativeOft.balanceOf(owner.address)).to.eq(initialSupply.sub(sendAmount))
        expect(await remoteOft.balanceOf(owner.address)).to.eq(sendAmount)
    })

    it("sets minSendAmount when called by the owner", async () => {
        const newMinAmount = utils.parseEther("2")
        await localNativeOft.setMinSendAmount(newMinAmount)
        expect(await localNativeOft.minSendAmount()).to.eq(newMinAmount)
    })

    it("reverts when a non-owner calls setMinSendAmount", async () => {
        await expect(localNativeOft.connect(user).setMinSendAmount(utils.parseEther("2"))).to.be.revertedWith("Ownable: caller is not the owner")
    })
})