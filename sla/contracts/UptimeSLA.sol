pragma solidity ^0.4.18;

import "chainlink/solidity/contracts/Chainlinked.sol";
import "chainlink/solidity/contracts/Chainlink.sol";

contract UptimeSLA is Chainlinked {
  uint256 public current;
  bytes32 public jobId;

  uint256 private requestId;
  address private client;
  address private serviceProvider;

  function UptimeSLA(
    address _client,
    address _serviceProvider,
    address _oracle,
    bytes32 _jobId
  ) public payable {
    client = _client;
    serviceProvider = _serviceProvider;
    oracle = Oracle(_oracle);
    jobId = _jobId;
  }

  function updateUptime(string _currency) public {
    Chainlink.Run memory run = newRun(jobId, this, "fulfill(uint256,uint256)");
    run.add("url", "https://status.heroku.com/api/ui/availabilities?filter%5Bregion%5D=US&page%5Bsize%5D=60");
    string[] memory path = new string[](4);
    path[0] = "data";
    path[1] = "0";
    path[2] = "attributes";
    path[3] = "calculation";
    run.add("path", path);
    requestId = chainlinkRequest(run);
  }

  function fulfill(uint256 _requestId, uint256 _rate)
    public
    onlyOracle
    checkRequestId(_requestId)
  {
    current = _rate;
    if (_rate < 9999) {
      client.send(this.balance);
    }
  }

  modifier checkRequestId(uint256 _requestId) {
    require(requestId == _requestId);
    _;
  }

}
