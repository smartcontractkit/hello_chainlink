let fs = require("fs");
let request = require("request");

let UptimeSLA = artifacts.require("./UptimeSLA.sol");
let Oracle = artifacts.require("../node_modules/smartcontractkit/chainlink/solidity/contracts/Oracle.sol");

module.exports = function(deployer) {
  let client = "0x542B68aE7029b7212A5223ec2867c6a94703BeE3";
  let serviceProvider = "0xB16E8460cCd76aEC437ca74891D3D358EA7d1d88";
  let url = "http://chainlink:twochains@localhost:6688/v2/jobs";

  fs.readFile("http_json_x10000_job.json", 'utf8', (err, file) => {
    let data = JSON.parse(file);
    console.log(`Posting to ${url}:\n`, data);
    request.post(url, {json: data},
      function (error, response, body) {
            if (!error && response.statusCode == 200) {
              console.log(`Deploying UptimeSLA:`)
              console.log(`\tjob: ${body.id}`);
              console.log(`\tclient: ${client}`);
              console.log(`\tservice provider: ${serviceProvider}`);

              deployer.deploy(UptimeSLA, client, serviceProvider, 1518857382, Oracle.address, body.id, {
                value: 1000000000
              });
            } else {
              console.log("chainlink error:", error);
              console.log("response status:", response.statusCode);
            }
        }
    );
  });
};
