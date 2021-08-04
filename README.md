# NFT - Auction

## Installation
1. Install **Truffle** ```npm install -g truffle```
2. Start Test Network 
   - Use ganache-cli
     - npm install -g ganache-cli
     - Run ganache-cli using following command
       - ```ganache-cli```
       - This will create Test network

## Compile, Deploy and Test Project
1. Inside that folder Compile with following command
   - ```truffle.cmd compile``` on Windows
   - ```truffle compile```

2. Deploy Contract with following command
   - ```truffle.cmd migrate```  on Windows
   - ```truffle migrate```

### The api.js file is located in the api folder.
All you need to do is the following command to start the server.
```node api.js```

1. Firstly, we have to register the token, approve it and the transfer to the Auction Smart contract.(only Owner of the smart contract can call these functions).
2. Then, Create the Auction (only Owner).
3. Anyone can then Bid on the Auction till it is ended or cancelled by the owner.
