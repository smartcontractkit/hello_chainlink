# Uptime Service Level Agreement

An example SLA that uses ChainLink to determine the release of payment.

When the contract is deployed a client, service provider, and start time are specified. Additionally a deposit is made. The end of the contract is set to 30 days after the start time.

After the contract is created anyone can request updates from the oracle for the contract. If the oracle reports that the uptime is below 99.99% then the deposit is released to the client. If the rate is still above 99.99% after the contract ends, and the deposit has not been released, the deposit is sent to the service provider.


# ChainLink

Initiator: `runLog`

Job Pipeline: `httpGet` => `jsonParse` => `multiply` => `ethUint256` => `ethTx`

This contract displays ChainLinks ability to pull in data from outside data feeds and format it to be used by Ethereum contracts.

A float value is pulled out of a nested JSON object and multiplied to a precision level that is useful for the contract.

The ChainLink Job is configured to not take any specific URL or JSON path, so that this oracle and job can be reused for other APIs. Both `url` and `path` are passed into the oracle by the SLA contract, specifically which data point to use is passed into the contract.


## Requirements

- Go 1.9+
- Node JS
- Docker

## Run Chainlink Development Environment

1. Check out repo [smartcontractkit/chainlink](https://github.com/smartcontractkit/chainlink) and navigate to folder.
2. Run `./internal/bin/devnet`
3. Run truffle migrations:
  1. `cd solidity`
  2. `yarn install`
  3. `./node_modules/.bin/truffle migrate --network devnet`
4. Run `./internal/bin/cldev` in top level repo folder

## Run and update the Uptime SLA contract.

1. Check out this repo and go to folder [hello_chainlink/uptime_sla](https://github.com/smartcontractkit/hello_chainlink/tree/master/uptime_sla).
2. `./create_x100_http_json_job` to create Wei Watchers Chainlink job
3. `yarn install`
4. `node echo.js`
5. `./node_modules/.bin/truffle migrate` in another window
6. Run `node send_ethlog_transaction.js` to trigger an update to the SLA
