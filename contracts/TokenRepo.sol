pragma solidity ^0.6.3;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TokenRepo is ERC721 {
    
    constructor() public ERC721("NFT-Ex", "NFE") {}
    
    function registerToken(uint256 _tokenId, string memory _uri) public {
       _mint(msg.sender, _tokenId);
       addMetadata(_tokenId, _uri);
       emit TokenRegistered(msg.sender, _tokenId);
    }
    
    function addMetadata(uint _tokenId, string memory _uri ) public returns(bool) {
        _setTokenURI(_tokenId, _uri);
    }
    
    event TokenRegistered(address _by, uint256 _tokenId);
}