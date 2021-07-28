const express = require('express');
const app = express();

app.use(express.json());

var Web3 = require('web3');
var web3 = new Web3('http://localhost:7545');

var token_artifacts =  require("../build/contracts/TokenRepo.json");
var auction_artifacts = require("../build/contracts/AuctionRepo.json");

var tokenabi = token_artifacts.abi;
var tokenaddress = token_artifacts.networks[5777].address;
var auctionabi = auction_artifacts.abi;
var auctionaddress = auction_artifacts.networks[5777].address;

var tokeninstance = new web3.eth.Contract(tokenabi, tokenaddress);
var auctioninstance = new web3.eth.Contract(auctionabi, auctionaddress);

account1 = "0x8deA93c14A4f2E601B85B47098ddA7801038B220";
account2 = "0x4eC3172c5724d81B2679e52ac3de75d9504B9ef8";

app.get('/', function(req, res) {

    res.send("API server");

});


app.get('/name', function(req, res) {

    tokeninstance.methods.name().call({from: account1,
    gas: 3000000}, function(err, result) {
        console.log(result);
        

         if (!err) {
            res.json(result);
            res.send('Token');

        } else
        res.status(401).json("Error" + err);
    });

});


app.get('/owner/:id', function(req, res) {

    var id = req.params.id;

    tokeninstance.methods.ownerOf(id).call({from: account1,
    gas: 3000000}, function(err, result) {
        console.log(result);
        

        if (!err) {
            res.json(result);

        } else
        res.status(401).json("Error" + err);
    });

});


// {
//     "_tokenId": 1,
//     "_uri": "we"
// }
app.post('/registerToken', function(req, res) {

    var tokenId = req.body._tokenId;
    var tokenUri = req.body._uri;

    tokeninstance.methods.registerToken(tokenId, tokenUri).send({
        from: account1,
        gas: 3000000
    }, function(err, result) {
        console.log(result);

        if (!err) {
            res.json(result);
            res.send('Registered Token');

        } else
        res.status(401).json("Error" + err);
    });

});

// {
//     "tokenId": 1
// }
app.post('/approve', function(req, res) {

    var to = auctionaddress;
    var tokenId = req.body.tokenId;

    tokeninstance.methods.approve(to, tokenId).send({
        from: account1,
        gas: 3000000
    }, function(err, result) {
        console.log(result);

        if (!err) {
            //res.json(result);
            res.send('Approved To Transfer Token To The Auction Contract');
        } else
        res.status(401).json("Error" + err);
    });

});

// {
//     "tokenId": 1
// }
app.post('/transfer', function(req, res) {

    var from = account1;
    var to = auctionaddress;
    var tokenId = req.body.tokenId;

    tokeninstance.methods.transferFrom(from, to, tokenId).send({
        from: account1,
        gas: 3000000
    }, function(err, result) {
        console.log(result);

        if (!err) {
            //res.json(result);
            res.send('Transfer Token To The Auction Contract');
        } else
        res.status(401).json("Error" + err);
    });

});


// {
//     "_tokenId" : 1,
//     "_startPrice" : 20,
//     "_blockDeadline" : 123,
//     "_bidIncrement" : 5
// }
app.post('/createAuction', function(req, res) {

    var _tokenRepositoryAddress = tokenaddress;
    var _tokenId = req.body._tokenId;
    var _startPrice = req.body._startPrice;
    var _blockDeadline = req.body._blockDeadline;
    var _bidIncrement = req.body._bidIncrement;

    auctioninstance.methods.createAuction(_tokenRepositoryAddress, _tokenId, _startPrice, _blockDeadline, _bidIncrement).send({
        from: account1,
        gas: 3000000
    }, function(err, result) {
        console.log(result);

        if (!err) {
            //res.json(result);
            res.send('Auction Created');
        } else
        res.status(401).json("Error" + err);
    });

});


app.get('/getAuction/:id', function(req, res) {

    var id = req.params.id;

    auctioninstance.methods.getAuctionById(id).call({
        from: account1,
        gas: 3000000
    }, function(err, result) {
        console.log(result);

        if (!err) {
            res.json(result);
        } else
        res.status(401).json("Error" + err);
    });

});

// {
//     "id" : 1,
//     "value" : 25
// }
app.post('/bid', function(req, res) {

    var id = req.body.id;
    var value = req.body.value;
    auctioninstance.methods.placeBid(id).send({
        from: account2,
        gas: 3000000,
        value: value
    }, function(err, result) {
        console.log(result);

        if (!err) {
            //res.json(result);
            res.send(`Bid Placed by ${account2}`);
        } else
        res.status(401).json("Error" + err);
    });

});

// {
//     "id" : 1
// }
app.post('/cancel', function(req, res) {

    var id = req.body.id;

    auctioninstance.methods.cancelAuction(id).send({
        from: account1,
        gas: 3000000
    }, function(err, result) {
        console.log(result);

        if (!err) {
            //res.json(result);
            res.send('Auction Cancelled');
        } else
        res.status(401).json("Error" + err);
    });

});



app.post('/finalize', function(req, res) {

    var id = req.body.id;

    auctioninstance.methods.finalizeAuction(id).send({
        from: account2,
        gas: 3000000
    }, function(err, result) {
        console.log(result);

        if (!err) {
            //res.json(result);
            res.send('Auction Finalized');
        } else
        res.status(401).json("Error" + err);
    });

});



app.post('/withdraw', function(req, res) {

    var id = req.body.id;

    auctioninstance.methods.withdraw(id).send({
        from: account2,
        gas: 3000000
    }, function(err, result) {
        console.log(result);

        if (!err) {
            //res.json(result);
            res.send('Withdraw complete');
        } else
        res.status(401).json("Error" + err);
    });

});


app.get('/bidsCount/:id', function(req, res) {

    var id = req.params.id;

    auctioninstance.methods.getBidsCount(id).call({
        from: account1,
        gas: 3000000
    }, function(err, result) {
        console.log(result);

        if (!err) {
            res.json(result);
        } else
        res.status(401).json("Error" + err);
    });

});


app.get('/getCurrentBid/:id', function(req, res) {

    var id = req.params.id;

    auctioninstance.methods.getCurrentBid(id).call({
        from: account1,
        gas: 3000000
    }, function(err, result) {
        console.log(result);

        if (!err) {
            res.json(result);
        } else
        res.status(401).json("Error" + err);
    });

});


//PORT
var port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
