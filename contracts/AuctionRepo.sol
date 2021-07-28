pragma solidity ^0.6.3;

import "./TokenRepo.sol";

contract AuctionRepo {
    
    //Auction[] public auctions;
    mapping(uint256 => Auction) private _auctions;
    
    mapping(uint256=>bidding) public bid;
    
    mapping(uint256 => bidding[]) public auctionBids;
    
    mapping(address => uint[]) public auctionOwner;
    
    mapping(uint256=>mapping(address => uint256)) public fundsByBidder;
    
    uint256 public _auctionIds;
    bool auctionstarted = false;
    bool firsttime = false;
    bool public canceled;
    
    struct Auction {
        uint256 blockDeadline;
        uint256 startPrice;
        uint256 tokenId;
        address tokenRepositoryAddress;
        address payable owner;
        bool active;
        bool finalized;
        bool exists;
        uint256 bidIncrement;
    }
    
    struct bidding {
        uint256 highestBindingBid; 
        address payable highestBidder;
        uint256 amount;
        address bidder;
    }
    
    
    
    
    
    
    modifier isOwner(uint _auctionId) {
        require(_auctions[_auctionId].owner == msg.sender);
        _;
    }
    
    modifier contractIsTokenOwner(address _tokenRepositoryAddress, uint256 _tokenId) {
        address tokenOwner = TokenRepo(_tokenRepositoryAddress).ownerOf(_tokenId);
        require(tokenOwner == address(this));
        _;
    }
    
    modifier minbid(uint256 id)
    {
        Auction memory auction = _auctions[id];
        if(msg.value<auction.startPrice) revert();
        _;
    }
    
    
    
    function getBidsCount(uint _auctionId) public view returns(uint) {
        return auctionBids[_auctionId].length;
    }
    
    function getCurrentBid(uint _auctionId) public view returns(uint256, address) {
        uint bidsLength = auctionBids[_auctionId].length;
        bidding memory lastBid = auctionBids[_auctionId][bidsLength]; //[bidsLength-1]
           
        return (lastBid.amount, lastBid.highestBidder);
    }
    
    
    function getAuctionById(uint256 id) public view returns(
        uint256 AuctionId,
        uint256 startPrice,
        uint256 tokenId,
        uint256 highestBindingBid,
        address owner,
        bool active,
        bool finalized,
        uint256 bidIncrement) {

        Auction memory auction = _auctions[id];
        bidding memory bid = bid[id];
        return (
            id,
            auction.startPrice,
            auction.tokenId,
            bid.highestBindingBid,
            auction.owner, 
            auction.active, 
            auction.finalized,
            auction.bidIncrement);
    }
    
    function createAuction(address _tokenRepositoryAddress, uint256 _tokenId, uint256 _startPrice, uint256 _blockDeadline, uint256 _bidIncrement) public contractIsTokenOwner(_tokenRepositoryAddress, _tokenId) returns(bool) {
        require(_startPrice >=0, "Price cannot be ledd than 0");
        
        _auctionIds++;
        _auctions[_auctionIds] = Auction( _blockDeadline, _startPrice, _tokenId, _tokenRepositoryAddress,msg.sender, true , false, true, _bidIncrement);
        
        //emit AuctionCreated(msg.sender, _auctionIds);
        return true;
    }

    function cancelAuction(uint256 id) public isOwner(id) returns (bool success) {
        
        canceled = true;
        Auction memory auction = _auctions[id];
        bidding memory bid = bid[id];
        
        uint bidLength = auctionBids[id].length;
        
        if(bidLength > 0) {
             bidding memory lastBid = auctionBids[id][bidLength -1];
             
             if(!lastBid.highestBidder.send(lastBid.amount)){
                 revert();
             }
        }
        
         if(approveAndTransfer(address(this), auction.owner, auction.tokenRepositoryAddress, auction.tokenId)){
            _auctions[id].active = false;
            //emit AuctionCanceled(msg.sender, id);
        }
        
        //LogCanceled();
        return true;
   }
   
    function approveAndTransfer(address _from, address _to, address _tokenRepositoryAddress, uint256 _tokenId) internal returns(bool) {
        TokenRepo remoteContract = TokenRepo(_tokenRepositoryAddress);
        remoteContract.approve(_to, _tokenId);
        remoteContract.transferFrom(_from, _to, _tokenId);
        return true;
    }     
    
    
    function finalizeAuction(uint id) public {
        Auction memory auction = _auctions[id];
        uint bidsLength = auctionBids[id].length;

        // 1. if auction not ended just revert
        if( block.timestamp < auction.blockDeadline ) revert();
        
        // if there are no bids cancel
        if(bidsLength == 0) {
            cancelAuction(id);
        }else{

            // 2. the money goes to the auction owner
            bidding memory lastBid = auctionBids[id][bidsLength - 1];
            if(!auction.owner.send(lastBid.amount)) {
                revert();
            }

            // approve and transfer from this contract to the bid winner 
            if(approveAndTransfer(address(this), lastBid.highestBidder, auction.tokenRepositoryAddress, auction.tokenId)){
                _auctions[id].active = false;
                _auctions[id].finalized = true;
                //emit AuctionFinalized(msg.sender, _auctionId);
            }
        }
    }

    function placeBid(uint256 id) public payable returns (bool success) {
    // reject payments of 0 ETH
    if (msg.value == 0) revert();
    
    bidding storage bid = bid[id]; 
    auctionstarted = true;
    Auction memory auction = _auctions[id];  

    uint newBid = fundsByBidder[id][msg.sender] + msg.value;
    bidding memory newB;
    newB.bidder = msg.sender;
    newB.amount = msg.value;
    
    auctionBids[id].push(newB);


    if (newBid <= bid.highestBindingBid) revert();

    // grab the previous highest bid (before updating fundsByBidder, in case msg.sender is the
    // highestBidder and is just increasing their maximum bid).
    uint highestBid = fundsByBidder[id][bid.highestBidder];

    fundsByBidder[id][msg.sender] = newBid;

    if (newBid <= highestBid) {
      
        if(newBid+auction.bidIncrement> highestBid)
        {
            bid.highestBindingBid = highestBid;
        }
        else
        {
            bid.highestBindingBid = newBid+auction.bidIncrement;
        }
    } else {
        
        if (msg.sender != bid.highestBidder) {
            bid.highestBidder = msg.sender;
        if(newBid+auction.bidIncrement> highestBid)
        {   if(firsttime==false)
            bid.highestBindingBid = highestBid;
            else
            {bid.highestBindingBid = auction.startPrice + auction.bidIncrement;
            firsttime=true;
            }
        }
        else
        {
            bid.highestBindingBid = newBid+auction.bidIncrement;
        }
        }
        highestBid = newBid;
    }

    //LogBid(msg.sender, newBid, bid.highestBidder, highestBid, bid.highestBindingBid);
    return true;
    }
    
    function withdraw(uint256 id) public payable returns (bool success) {   
    require(canceled==true);
    require(auctionstarted==true);
    address payable withdrawalAccount;
    uint withdrawalAmount;
    bidding storage bid = bid[id]; 
    
        if (msg.sender == bid.highestBidder) {
            withdrawalAccount = bid.highestBidder;
            withdrawalAmount = fundsByBidder[id][bid.highestBidder];
        }
        else {
            withdrawalAccount = msg.sender;
            withdrawalAmount = fundsByBidder[id][withdrawalAccount];
        }

    if (withdrawalAmount == 0) revert();

    fundsByBidder[id][withdrawalAccount] -= withdrawalAmount;

    // send the funds
    if (!msg.sender.send(withdrawalAmount)) revert();

    //LogWithdrawal(msg.sender, withdrawalAccount, withdrawalAmount);

    return true;
}
    
}