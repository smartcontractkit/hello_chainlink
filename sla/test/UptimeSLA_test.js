'use strict';

require('./support/helpers.js')

contract('UptimeSLA', () => {
  let Oracle = artifacts.require("../node_modules/smartcontractkit/chainlink/solidity/contracts/Oracle.sol");
  let SLA = artifacts.require("UptimeSLA.sol");
  let jobId = "4c7b7ffb66b344fbaa64995af81e355a";
  let deposit = 1000000000;
  let oc, sla;
  let client = "0x542B68aE7029b7212A5223ec2867c6a94703BeE3";
  let serviceProvider = "0xB16E8460cCd76aEC437ca74891D3D358EA7d1d88";

  beforeEach(async () => {
    oc = await Oracle.new({from: oracleNode});
    sla = await SLA.new(client, serviceProvider, oc.address, jobId, {
      value: deposit
    });
  });

  describe("before updates", () => {
    it("does not release money to anyone", async () => {
      assert.equal(await eth.getBalance(sla.address), deposit);
      assert.equal(await eth.getBalance(client), 0);
      assert.equal(await eth.getBalance(serviceProvider), 0);
    });
  });

  describe("#updateUptime", () => {
    it("triggers a log event in the Oracle contract", async () => {
      let tx = await sla.updateUptime("usd");

      let events = await getEvents(oc);
      assert.equal(1, events.length)
      let event = events[0]
      assert.equal(event.args.data, `{"url":"https://status.heroku.com/api/ui/availabilities?filter%5Bregion%5D=US&page%5Bsize%5D=60","path":["data","0","attributes","calculation"]}`)

      assert.equal(web3.toUtf8(event.args.jobId), jobId);
    });
  });

  describe("#fulfillData", () => {
    let response = "0x00000000000000000000000000000000000000000000000000000000000f8c4c";
    let requestId;

    beforeEach(async () => {
      await sla.updateUptime("usd");
      let event = await getLatestEvent(oc);
      requestId = event.args.id
    });

    it("records the data given to it by the oracle", async () => {
      await oc.fulfillData(requestId, response, {from: oracleNode})

      let received = await sla.current.call();
      assert.equal(1018956, received);
    });

    context("when the value is below 9999", async () => {
      let response = "0x000000000000000000000000000000000000000000000000000000000000270e";

      it("sends the deposit to the client", async () => {
        await oc.fulfillData(requestId, response, {from: oracleNode})

        assert.equal(await eth.getBalance(sla.address), 0);
        assert.equal(await eth.getBalance(client), deposit);
        assert.equal(await eth.getBalance(serviceProvider), 0);
      });
    });

    context("when the consumer does not recognize the request ID", () => {
      beforeEach(async () => {
        await oc.requestData(jobId, sla.address, functionSelector("fulfill(uint256,bytes32)"), "");
        let event = await getLatestEvent(oc);
        requestId = event.args.id;
      });

      it("does not aslaept the data provided", async () => {
        let tx = await sla.updateUptime("usd");

        await assertActionThrows(async () => {
          await oc.fulfillData(requestId, response, {from: oracleNode})
        });

        let received = await sla.current.call();
        assert.equal(received, 0);
      });
    });

    context("when called by anyone other than the oracle contract", () => {
      it("does not aslaept the data provided", async () => {
        await assertActionThrows(async () => {
          await sla.fulfill(requestId, response, {from: oracleNode})
        });

        let received = await sla.current.call();
        assert.equal(received, 0);
      });
    });
  });
});
