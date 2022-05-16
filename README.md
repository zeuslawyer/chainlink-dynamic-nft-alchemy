# REPOSITORY FOR THE ALCHEMY ROAD TO WEB3 DEVELOPER PROGRAM

### Branches

- `main`: has the starting code and the IPFS picture and json files. Also has the Dynamic NFT (ERC721) smart contract code.
- `price-feeds` has the code that adds [Chainlink Data Feeds](https://docs.chain.link/docs/get-the-latest-price/) logic and functionality. It also has the mock Price Feeds smart contract called `MockPriceFeed.sol` which can be used to mock what calls to the actual Chainlink price feed would do. An example of what the return value from a price feed looks like is: `int256 3034715771688` which denotes the price up to 8 decimals.
- `randomness` contains the code for the [assignment](#assignment)

### Assignment

Update the NFT contract code to make the following happen:

- track the current market trend (hint: use an enum like `enum MarketTrend{BULL, BEAR}`)
- update `performUpkeep` so that it tracks the latest market trend based on the `getLatestPrice()` and if there is a price change, it calls another function (eg `requestRandomnessForNFTUris()`) that initiates the process of calling a [Chainlink VRF V2 Coordinator](https://docs.chain.link/docs/get-a-random-number/) for a random number.
- implement `fulfillRandomWords()` as per the VRF documentation

A suggested implementation of the assignment is in the branch called `randomness`.
