const TokenRepo = artifacts.require("TokenRepo");
const AuctionRepo = artifacts.require("AuctionRepo");

module.exports = function (deployer) {
  deployer.deploy(AuctionRepo);
  deployer.deploy(TokenRepo);
};
