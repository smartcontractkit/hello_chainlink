#!/usr/bin/env node

var Web3            = require('web3'),
    contract        = require("truffle-contract"),
    path            = require('path')
    SimpleLogJSON   = require(path.join(__dirname, 'build/contracts/SimpleLog.json'));

var provider = new Web3.providers.HttpProvider("http://127.0.0.1:18545");
var SimpleLog = contract(SimpleLogJSON);
SimpleLog.setProvider(provider);
var devnetAddress = "0x9CA9d2D5E04012C9Ed24C0e513C9bfAa4A2dD77f";

SimpleLog.deployed().then(function(instance) {
  return instance.logEvent({from: devnetAddress});
}).then(console.log, console.log);
