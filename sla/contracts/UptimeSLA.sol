pragma solidity ^0.4.18;

import "chainlink/solidity/contracts/Chainlinked.sol";
import "chainlink/solidity/contracts/Chainlink.sol";

contract UptimeSLA is Chainlinked {
  uint256 private requestId;
  uint256 public current;
  bytes32 public jobId;

  function UptimeSLA(address _oracle, bytes32 _jobId) public {
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

  function fulfill(uint256 _requestId, uint256 _data)
    public
    onlyOracle
    checkRequestId(_requestId)
  {
    current = _data;
  }

  modifier checkRequestId(uint256 _requestId) {
    require(requestId == _requestId);
    _;
  }

}
