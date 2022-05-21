// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol";

/**
 *  Constructor for the mock takes two arguments: _baseFee and _gasPriceLink (gas unit price in link)
 * for _baseFee pass in  100000000000000000; i.e 0.1 LINK
 * for _gasPriceLink pass in 1000000000 ; i.e 0.000000001 LINK per gas
 */

// STEPS TO USE THIS MOCK
// [1] Call createSubscription(). The subscript IDs returned is a uint64 and starts from 1. You can see the returned
// value in Remix's Logs under "Decoded Output".
// [2] fund your mock subscription and pass in the subscription ID and 1000000000000000000 (10 LINK) as the params. You can check your funding
// is completed by calling getSubscription() - it should return the correct details as per the LINK you've added etc.
// [3] Back in the Bull&Bear Deployed contract, ensure that the COORDINATOR field points to this mock Coordinator. Check the tokenUri
// or the currentMarketTrend to see what the last recorded trend was.
// [4] reverse the trend by calling updateAnswer() in your mock price feed aggregator.
// [5] Back in the Bull&Bear, check that currentPrice reflects the old price.  Then run performUpkeep and pass in `[]` as the param. Take
// a look in the Remix logs window and you should the the Request ID for random words logged. Make a note of that request Id.
// [6] Check that currentMarketTrend has updated and is the opposite of what you previously checked.
// [7] At this stage your NFT smart contract's `fulfillRandomWords()` callback has not yet been called.  This needs to be manually called
// in your mock VRF Coordinator. Switch to the mock VRF Coordinator and call `fulfillRandomWords()` and pass in the requestID you just noted and
// the contract address for your Bull&Bear contract.
// [8] This should call the ``fulfillRandomWords()` in your Bull&Bear contract - and if you check the `s_randomWords` field
// you will see your random number there.  Call `tokenURI()` and it should now be pointing to a different JSON, reflecting the latest
// market trend decided by the latest price.

// Back in the NFT Smart Contract, don't forget to call setSubscriptionId() so the calls to getRandomWords() will succeed!

//(reference here: https://docs.chain.link/docs/get-a-random-number/#create-and-fund-a-subscription)
