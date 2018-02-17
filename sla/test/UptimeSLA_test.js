'use strict';

require('./support/helpers.js')

contract('UptimeSLA', () => {
  let Oracle = artifacts.require("../node_modules/smartcontractkit/chainlink/solidity/contracts/Oracle.sol");
  let SLA = artifacts.require("UptimeSLA.sol");
  let jobId = "4c7b7ffb66b344fbaa64995af81e355a";
  let oc, cc;

  beforeEach(async () => {
    oc = await Oracle.new({from: oracleNode});
    cc = await SLA.new(oc.address, jobId, {from: stranger});
  });

  describe("#updateUptime", () => {
    it("triggers a log event in the Oracle contract", async () => {
      let tx = await cc.updateUptime("usd");

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
      await cc.updateUptime("usd");
      let event = await getLatestEvent(oc);
      requestId = event.args.id
    });

    it("records the data given to it by the oracle", async () => {
      await oc.fulfillData(requestId, response, {from: oracleNode})

      let received = await cc.current.call();
      assert.equal(1018956, response);
    });

    context("when the consumer does not recognize the request ID", () => {
      beforeEach(async () => {
        await oc.requestData(jobId, cc.address, functionSelector("fulfill(uint256,bytes32)"), "");
        let event = await getLatestEvent(oc);
        requestId = event.args.id;
      });

      it("does not accept the data provided", async () => {
        let tx = await cc.updateUptime("usd");

        await assertActionThrows(async () => {
          await oc.fulfillData(requestId, response, {from: oracleNode})
        });

        let received = await cc.current.call();
        assert.equal(received, 0);
      });
    });

    context("when called by anyone other than the oracle contract", () => {
      it("does not accept the data provided", async () => {
        await assertActionThrows(async () => {
          await cc.fulfill(requestId, response, {from: oracleNode})
        });

        let received = await cc.current.call();
        assert.equal(received, 0);
      });
    });
  });
});
