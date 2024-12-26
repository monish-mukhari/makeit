import { PublicKey } from "@solana/web3.js";

export const generateMetadata = (mintAddress: PublicKey, name: string, symbol: string, metadataUri: string) => {
    return {
        mint: mintAddress,
        name: name,
        symbol: symbol,
        uri: metadataUri,
        additionalMetadata: []
    };
};

