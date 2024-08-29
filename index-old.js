const { ethers } = require("ethers"); // Use require for CommonJS
const ABI = require("./abi.json"); // Load ABI using require
require("dotenv").config(); // Load environment variables

async function listenForFreeVote() {
    const smartcontract = "0xFc03A774c33435F9E56AE278a5a91677A918A266"; // Your contract address

    // Initialize a WebSocket provider using Alchemy
    const provider = new ethers.WebSocketProvider(
        `wss://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
    );

    // Create a contract instance
    const contract = new ethers.Contract(smartcontract, ABI, provider);

    // Listen for the FreeVote event
    contract.on("FreeVote", (user, contractAddress, amount, tag, concept, event) => {
        const freeVoteEvent = {
            user: user,
            contractAddress: contractAddress,
            amount: amount.toString(),
            tag: tag,
            concept: concept,
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
        };
        console.log(JSON.stringify(freeVoteEvent, null, 4));
    });

    console.log('Listening for FreeVote events...');
}

listenForFreeVote();
