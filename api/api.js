var express = require('express');
var app = express();

app.use(express.json());

var Web3 = require('web3');

var token_artifacts =  require("../build/contracts/TokenRepo.json");
var auction_artifacts = require("../build/contracts/AuctionRepo.json");

var tokenabi = token_artifacts.abi;
var tokenaddress = token_artifacts.networks[5777].address;
var auctionabi = auction_artifacts.abi;
var auctionaddress = auction_artifacts.networks[5777].address;

var init = async() => {
var web3 = new Web3('http://localhost:7545');

var tokeninstance = new web3.eth.Contract(tokenabi, tokenaddress);
var auctioninstance = new web3.eth.Contract(auctionabi, auctionaddress);

var addresses = await web3.eth.getAccounts();

app.get('/', function(req, res) {

    res.send("API server");

});


app.get('/name', function(req, res) {

    tokeninstance.methods.name().call({from: addresses[0],
    gas: 3000000}, function(err, result) {
        console.log(result);
        

         if (!err) {
            res.json(result);

        } else
        res.status(401).json("Error" + err);
    });

});


app.get('/owner/:id', function(req, res) {

    var id = req.params.id;

    tokeninstance.methods.ownerOf(id).call({from: addresses[0],
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
        from: addresses[0],
        gas: 3000000
    }, function(err, result) {
        console.log(result);

        if (!err) {
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
        from: addresses[0],
        gas: 3000000
    }, function(err, result) {
        console.log(result);

        if (!err) {
            
            res.send('Approved To Transfer Token To The Auction Contract');
        } else
        res.status(401).json("Error" + err);
    });

});

// {
//     "tokenId": 1
// }
app.post('/transfer', function(req, res) {

    var from = addresses[0];
    var to = auctionaddress;
    var tokenId = req.body.tokenId;

    tokeninstance.methods.transferFrom(from, to, tokenId).send({
        from: addresses[0],
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
        from: addresses[0],
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
        from: addresses[0],
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
        from: addresses[1],
        gas: 3000000,
        value: value
    }, function(err, result) {
        console.log(result);

        if (!err) {
            //res.json(result);
            res.send(`Bid Placed by ${addresses[1]}`);
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
        from: addresses[0],
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
        from: addresses[0],
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
        from: addresses[1],
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
        from: addresses[0],
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
        from: addresses[0],
        gas: 3000000
    }, function(err, result) {
        console.log(result);

        if (!err) {
            res.json(result);
        } else
        res.status(401).json("Error" + err);
    });

});
}
init();

//PORT
var port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));

