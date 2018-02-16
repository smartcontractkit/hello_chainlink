# Wei Watchers

Using Chainlink, this application simply echos incoming ethereum logs.

![Log Echo Server](screenshot.jpg?raw=true "Log Echo Server")

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

## Run Wei Watchers

1. Check out this repo and go to folder [hello_chainlink/wei_watchers](https://github.com/smartcontractkit/hello_chainlink/tree/master/wei_watchers).
2. `./create_cl_job` to create Wei Watchers Chainlink job
3. `yarn install`
4. `node echo.js`
5. `./node_modules/.bin/truffle migrate` in another window
6. `node send_transaction.js`
7. Wait for log to show up in echo server
