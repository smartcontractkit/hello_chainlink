var UptimeSLA = artifacts.require("./UptimeSLA.sol");
let Oracle = artifacts.require("../node_modules/smartcontractkit/chainlink/solidity/contracts/Oracle.sol");

var client = "0x542B68aE7029b7212A5223ec2867c6a94703BeE3";
var serviceProvider = "0xB16E8460cCd76aEC437ca74891D3D358EA7d1d88";

module.exports = function(deployer) {
  deployer.deploy(UptimeSLA, client, serviceProvider, 1518857382, Oracle.address, "someJobID");
};
