// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/mocks/VRFCoordinatorV2Mock.sol";

// Constructor for the mock takes two arguments: _baseFee and _gasPriceLink (gas unit price in link)

// for _baseFee pass in  100000000000000000; i.e 0.1 LINK
// for _gasPriceLink pass in 1000000000 ; i.e 0.000000001 LINK per gas