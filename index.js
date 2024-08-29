const { ethers } = require("ethers"); // Use require for CommonJS
const ABI = require("./abi.json"); // Load ABI using require
require("dotenv").config(); // Load environment variables
const { createClient } = require('@supabase/supabase-js'); // Import Supabase

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listenForFreeVote() {
    const smartcontract = "0xFc03A774c33435F9E56AE278a5a91677A918A266"; // Your contract address

    // Initialize a WebSocket provider using Alchemy
    const provider = new ethers.WebSocketProvider(
        `wss://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_KEY}`
    );

    // Create a contract instance
    const contract = new ethers.Contract(smartcontract, ABI, provider);

    // Listen for the FreeVote event
    contract.on("FreeVote", async (user, contractAddress, amount, tag, concept, event) => {
        // Retrieve the transaction details
        const transaction = await event.getTransaction();
        
        // Extract block number and transaction hash
        const blockNumber = transaction.blockNumber;
        const transactionHash = transaction.hash;

        const freeVoteEvent = {
            user: user,
            contractAddress: contractAddress,
            amount: amount.toString(),
            tag: tag,
            concept: concept,
            blockNumber: blockNumber,
            transactionHash: transactionHash,
        };

        console.log(JSON.stringify(freeVoteEvent, null, 4));

        // Insert the event data into Supabase
        const { data, error } = await supabase
            .from('web3_events_listener') // Your table name
            .insert([
                {
                    user: user,
                    contract_address: contractAddress,
                    amount: amount.toString(),
                    tag: tag,
                    concept: concept,
                    block_number: blockNumber,
                    transaction_hash: transactionHash,
                }
            ]);

        if (error) {
            console.error('Error inserting data into Supabase:', error);
        } else {
            console.log('Data successfully inserted into Supabase:', data);
        }
    });

    console.log('Listening for FreeVote events...');
}

listenForFreeVote();
