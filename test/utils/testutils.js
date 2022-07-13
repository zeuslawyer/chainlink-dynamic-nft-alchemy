const { network } = require("hardhat");

async function moveTime(amount) {
  await network.provider.send("evm_increaseTime", [amount]);
  console.log(`Moved forward in time ${amount} seconds`);
}

async function moveBlocks(amount) {
  for (let index = 0; index < amount; index++) {
    await network.provider.request({
      method: "evm_mine",
      params: [],
    });
  }
  console.log(`Moved ${amount} blocks`);
}
module.exports = {
  moveTime,
  moveBlocks,
};
