require('dotenv').config();
const express = require('express');
const Web3 = require('web3');
const IPFS = require('ipfs-http-client');
const zillaAddress = process.env["ZILLA_ADDRESS"];
const infuraId = process.env["INFURA_ID"];
const revealedCID = process.env["REVELAED_IPFS_URL"];
const unrevealedCID = process.env["UNREVEALED_IPFS_URL"];
const artifacts = require('./ChillaZilla.json');
const app = express();

const port = process.env.PORT || 3000
var zillaContract

const init = async () => {
    web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/'+infuraId))
    const networkId = await web3.eth.net.getId();
    // const networkData = artifacts.networks[networkId];
    // if(networkData){
    //   const zillaContract = new web3.eth.Contract(
    //    artifacts.abi,
    //   networkData.address
    //    );
    // }
    zillaContract = new web3.eth.Contract(artifacts.abi, zillaAddress)
    ipfs = await ipfsClient();
}

async function ipfsClient() {
    const ipfs = await IPFS.create(
        {
            host:"ipfs.infura.io",
            port:5001,
            protocol:"https"
        }
    );
    return ipfs;
}

init();

app.listen(port)

var web3;
var ipfs;
// var zillaContract;

// if (typeof web3 !== 'undefined') {
//      web3 = new Web3(web3.currentProvider)    
//   } else {
//      web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/'+infuraId))    
// }


app.get('/', async (req,res)=>{
 
    // const chillaZilla = new web3.eth.Contract(artifacts.abi, zillaAddress)
    
    // try{

        // var name = await chillaZilla.methods.name().call()
        var name = await zillaContract.methods.name().call()
        res.send('We are at homepage of ' + name.toString())
    // }catch(err){
    //     res.send(err)
    // }
})

app.get('/api/metadata/:token_id', async (req, res) => {

    const tokenId = parseInt(req.params.token_id).toString()
    // const chillaZilla = new web3.eth.Contract(artifacts.abi, zillaAddress)
   
    if(tokenId>=0 && tokenId <9999){
        var metadataUri;
        var metaData;
    
    if(tokenId >=0 && tokenId < 6666){
        // adult zilla metadata        
        metadataUri = revealedCID+"/"+tokenId+".json"

    }else if (tokenId >= 6666 && tokenId < 9999){
        // hatchling zilla metadata
        const revealed = await zillaContract.methods.hatchlingZilla(tokenId).call()

        if(revealed==2){
            console.log("revealed")
             metadataUri = revealedCID+"/"+tokenId+".json"
        }
        else if (revealed==1){
            console.log("not revealed")
             metadataUri = unrevealedCID+"/"+tokenId+".json"
        }else{
            res.json({"detail": "Zilla has not been hatched","image":"unminted zilla image url"});
        }
    } 
    for await (file of ipfs.cat(metadataUri)){
        console.log(file.toString())
        metaData = file;
    }
    res.send(JSON.parse(metaData.toString()));
    }
    else{
        res.json({"detail": "Zilla not found"});
    }

})
