const { expect } = require("chai");
const { ethers } = require("hardhat");

let deployer, owner1;
let Token, tokenContract;
let TOKEN_ID_0, TOKEN_ID_1;

before(async () => {
  [deployer, owner1] = await ethers.getSigners();
  Token = await ethers.getContractFactory("BullBear");
  tokenContract = await Token.deploy();
  TOKEN_ID_0 = 0;
  TOKEN_ID_1 = 1;
});

describe("Test Bull&Bear", () => {
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

    expect(await tokenContract.ownerOf(TOKEN_ID_0)).to.equal(owner1.address);
    expect(await tokenContract.tokenURI(TOKEN_ID_0)).to.include(
      "filename=gamer_bull.json"
    );

    await expect(tokenContract.tokenURI(TOKEN_ID_1)).to.be.revertedWith(
      "ERC721URIStorage: URI query for nonexistent token"
    );
  });
});
