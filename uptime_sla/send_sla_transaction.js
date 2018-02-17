#!/usr/bin/env node

let Web3 = require('web3');
let TruffleContract = require("truffle-contract");
let UptimeSLAJSON = require('./build/contracts/UptimeSLA.json');

var provider = new Web3.providers.HttpProvider("http://127.0.0.1:18545");
var UptimeSLA = TruffleContract(UptimeSLAJSON);
UptimeSLA.setProvider(provider);
if (typeof UptimeSLA.currentProvider.sendAsync !== "function") {
  UptimeSLA.currentProvider.sendAsync = function() {
    return UptimeSLA.currentProvider.send.apply(
      UptimeSLA.currentProvider, arguments
    );
  };
}
var devnetAddress = "0x9CA9d2D5E04012C9Ed24C0e513C9bfAa4A2dD77f";

UptimeSLA.deployed().then(function(instance) {
  console.log("deployed!")
  return instance.updateUptime('0', {from: devnetAddress});
}).then(console.log, console.log);
