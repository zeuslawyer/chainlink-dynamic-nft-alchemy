const { expect } = require("chai");
const { ethers } = require("hardhat");
const { moveBlocks, moveTime } = require("./utils/testutils");

let deployer, owner1;
let Token, tokenContract, PriceFeedMock, priceFeedMock;

const TOKEN_ID_0 = 0;
const TOKEN_ID_1 = 1;

const UPDATE_INTERVAL_SEC = 60;
const DECIMALS = 8;
const INITIAL_PRICE = 3000000000000;

const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""));

const resetPrice = async () => {
  if (!priceFeedMock) {
    return Promise.reject("No mock price feed instantiated");
  }

  const resetPriceTx = await priceFeedMock.updateAnswer(INITIAL_PRICE);
  await resetPriceTx.wait(1);
};

before(async () => {
  [deployer, owner1] = await ethers.getSigners();
  PriceFeedMock = await ethers.getContractFactory("MockV3Aggregator");
  priceFeedMock = await PriceFeedMock.deploy(DECIMALS, INITIAL_PRICE);

  Token = await ethers.getContractFactory("BullBear");
  tokenContract = await Token.deploy(
    UPDATE_INTERVAL_SEC,
    priceFeedMock.address
  );
});

afterEach(async () => {
  await resetPrice();
});

describe("Bull&Bear Token Contract", () => {
  it("Should deploy Bull&Bear token contract correctly", async () => {
    await tokenContract.deployed();

    const bigNum = await tokenContract.totalSupply();
    expect(bigNum).to.equal(0);

    expect(await tokenContract.owner()).to.equal(deployer.address);
    expect(await tokenContract.balanceOf(deployer.address)).to.equal(0);

    await expect(tokenContract.ownerOf(TOKEN_ID_0)).to.be.revertedWith(
      "ERC721: owner query for nonexistent token"
    );
    await expect(tokenContract.tokenURI(TOKEN_ID_0)).to.be.revertedWith(
      "ERC721URIStorage: URI query for nonexistent token"
    );
  });

  it("should mint token correctly", async () => {
    const mintTx = await tokenContract.safeMint(owner1.address);
    await mintTx.wait(1);

    expect(await tokenContract.totalSupply()).to.equal(1);

    // Test ownership of tokens by token ID.
    expect(await tokenContract.ownerOf(TOKEN_ID_0)).to.equal(owner1.address);
    await expect(tokenContract.ownerOf(TOKEN_ID_1)).to.be.revertedWith(
      "ERC721: owner query for nonexistent token"
    );

    //  Test Token URIs by Token ID.
    expect(await tokenContract.tokenURI(TOKEN_ID_0)).to.include(
      "filename=gamer_bull.json"
    );
    await expect(tokenContract.tokenURI(TOKEN_ID_1)).to.be.revertedWith(
      "ERC721URIStorage: URI query for nonexistent token"
    );

    // Test account balances.
    expect(await tokenContract.balanceOf(deployer.address)).to.equal(0);
    expect(await tokenContract.balanceOf(owner1.address)).to.equal(1);
  });

  it("Should correctly retrieve latest price from price feed ", async () => {
    expect(parseInt(await tokenContract.currentPrice())).to.equal(
      INITIAL_PRICE
    );

    // Update price feed with new increased price.
    const increasedPrice = INITIAL_PRICE + 12345;
    const updatePriceTx = await priceFeedMock.updateAnswer(increasedPrice);
    await updatePriceTx.wait(1);

    let latestPriceBigNum = await tokenContract.getLatestPrice();

    expect(latestPriceBigNum).to.equal(increasedPrice);
    expect(await tokenContract.currentPrice()).to.equal(INITIAL_PRICE);

    // Update price feed with new decreased price.
    const decreasedPrice = INITIAL_PRICE - 99995;
    const decreasedPriceTx = await priceFeedMock.updateAnswer(decreasedPrice);
    await decreasedPriceTx.wait(1);

    latestPriceBigNum = await tokenContract.getLatestPrice();

    expect(latestPriceBigNum).to.equal(decreasedPrice);
    expect(await tokenContract.currentPrice()).to.equal(INITIAL_PRICE);

    await resetPrice();
  });

  it("checkUpkeep should return correctly", async () => {
    // On deployment.

    let { upkeepNeeded } = await tokenContract.checkUpkeep(checkData);
    expect(upkeepNeeded).to.be.false;

    // Fast forward less than update interval.
    await moveTime(10);
    await moveBlocks(1);
    upkeepNeeded = (await tokenContract.checkUpkeep(checkData)).upkeepNeeded;
    expect(upkeepNeeded).to.be.false;

    // Fast forward by more than Update Interval.
    await moveTime(UPDATE_INTERVAL_SEC + 1);
    await moveBlocks(1);

    upkeepNeeded = (await tokenContract.checkUpkeep(checkData)).upkeepNeeded;
    expect(upkeepNeeded).to.be.true;
  });

  it("Correctly does not perform upkeep", async () => {
    // Get initial Token URI
    const currentUri = await tokenContract.tokenURI(TOKEN_ID_0);
    console.log(" CURRENT URI: ", currentUri);

    // No change in price.
    let upkeepTx = await tokenContract.performUpkeep(checkData);
    upkeepTx.wait(1);
    expect(await tokenContract.tokenURI(TOKEN_ID_0)).to.equal(currentUri);

    // Change in price but no Upkeep interval not past.
    let newPrice = INITIAL_PRICE + 10000;
    let newPriceTx = await priceFeedMock.updateAnswer(newPrice);
    await newPriceTx.wait(1);

    upkeepTx = await tokenContract.performUpkeep(checkData);
    upkeepTx.wait(1);
    expect(await tokenContract.tokenURI(TOKEN_ID_0)).to.equal(currentUri);
  });

  it("Correctly updates timestamp during performUpkeep ", async () => {
    const latestBlockTs = await getLatestBlockTs();
    let lastUpkeepTs = (await tokenContract.lastTimeStamp()).toNumber();

    moveTime(UPDATE_INTERVAL_SEC + 1);
    moveBlocks(1);

    // Perform upkeep to update last upkeep timestamp in Token contract.
    let upkeepTx = await tokenContract.performUpkeep(checkData);
    upkeepTx.wait(1);
    const updatedUpkeepTs = (await tokenContract.lastTimeStamp()).toNumber();

    expect(updatedUpkeepTs).to.not.equal(lastUpkeepTs);
    expect(updatedUpkeepTs).to.be.greaterThan(lastUpkeepTs);
  });

  it("Upkeep correctly updates Token URIs on consecutive price decreases", async () => {
    let newPrice = INITIAL_PRICE - 10000;
    let newPriceTx = await priceFeedMock.updateAnswer(newPrice);
    await newPriceTx.wait(1);

    // Move forward time to go past interval.
    moveTime(UPDATE_INTERVAL_SEC + 1);
    moveBlocks(1);

    upkeepTx = await tokenContract.performUpkeep(checkData);
    upkeepTx.wait(1);

    const newTokenUri = await tokenContract.tokenURI(TOKEN_ID_0);

    expect(newTokenUri).to.include("filename=beanie_bear.json");

    // Decrease price again to check that Token URI does not update.
    newPrice = newPrice - 30000;
    newPriceTx = await priceFeedMock.updateAnswer(newPrice);
    await newPriceTx.wait(1);

    moveTime(UPDATE_INTERVAL_SEC + 1);
    moveBlocks(1);

    upkeepTx = await tokenContract.performUpkeep(checkData);
    upkeepTx.wait(1);

    expect(newTokenUri).to.include("filename=beanie_bear.json");

    await resetPrice();
  });

  it("Upkeep correctly updates Token URIs on consecutive price increases", async () => {
    let newPrice = INITIAL_PRICE + 10000;
    let newPriceTx = await priceFeedMock.updateAnswer(newPrice);
    await newPriceTx.wait(1);

    // Move forward time to go past interval.
    moveTime(UPDATE_INTERVAL_SEC + 1);
    moveBlocks(1);

    let upkeepTx = await tokenContract.performUpkeep(checkData);
    upkeepTx.wait(1);

    const newTokenUri = await tokenContract.tokenURI(TOKEN_ID_0);

    expect(newTokenUri).to.include("filename=gamer_bull.json");

    // Decrease price again to check that Token URI does not update.
    newPrice = newPrice + 30000;
    newPriceTx = await priceFeedMock.updateAnswer(newPrice);
    await newPriceTx.wait(1);

    moveTime(UPDATE_INTERVAL_SEC + 1);
    moveBlocks(1);

    upkeepTx = await tokenContract.performUpkeep(checkData);
    upkeepTx.wait(1);

    expect(newTokenUri).to.include("filename=gamer_bull.json");

    await resetPrice();
  });
});

// ============ HELPERS =============
// **********************************
// ==================================

async function getLatestBlockTs() {
  let latestBlock = await ethers.provider.getBlock("latest");
  return latestBlock.timestamp;
}
