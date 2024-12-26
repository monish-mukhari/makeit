import { useState } from "react";
import FileUpload from "../ui/FileUpload";
import { Input } from "../ui/Input";
import { uploadImage } from "../utils/UploadImage";
import { generateMetadata } from "../utils/GenerateMetadata";
import { uploadMetadata } from "../utils/UploadMetadata";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { createAssociatedTokenAccountInstruction, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, createMintToInstruction, ExtensionType, getAssociatedTokenAddressSync, getMintLen, LENGTH_SIZE, TOKEN_2022_PROGRAM_ID, TYPE_SIZE } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import { generateSubMetadata } from "../utils/GenerateSubMetadata";



export function TokenLaunchpad() {

    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");
    const [decimals, setDecimals] = useState("");
    const [initialSupply, setInitialSupply] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<null | File>(null);

    const wallet = useWallet();
    const { connection } = useConnection();

    const handleClick = async () => {
        if(image && wallet.publicKey) {
            const mintAddress = Keypair.generate();
            const imageUrl = await uploadImage(image);
            const subMetadata = await generateSubMetadata(name, symbol, description, imageUrl);
            const metadataUri = await uploadMetadata(subMetadata);
            const metadata = generateMetadata(mintAddress.publicKey, name, symbol, metadataUri);

            const mintLen = getMintLen([ExtensionType.MetadataPointer]);
            const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

            const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);
            const transaction = new Transaction().add(
                SystemProgram.createAccount({
                    fromPubkey: wallet.publicKey,
                    newAccountPubkey: mintAddress.publicKey,
                    lamports,
                    space: mintLen,
                    programId: TOKEN_2022_PROGRAM_ID
                }),
                createInitializeMetadataPointerInstruction(mintAddress.publicKey, wallet.publicKey, mintAddress.publicKey, TOKEN_2022_PROGRAM_ID),
                createInitializeMintInstruction(mintAddress.publicKey, parseInt(decimals), wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
                createInitializeInstruction({
                    programId: TOKEN_2022_PROGRAM_ID,
                    mint: mintAddress.publicKey,
                    metadata: mintAddress.publicKey,
                    name: metadata.name,
                    symbol: metadata.symbol,
                    uri: metadata.uri,
                    mintAuthority: wallet.publicKey,
                    updateAuthority: wallet.publicKey

                })
            );

            transaction.feePayer = wallet.publicKey;
            transaction.recentBlockhash =(await connection.getLatestBlockhash()).blockhash;
            transaction.partialSign(mintAddress);

            await wallet.sendTransaction(transaction, connection);
            console.log(`Token mint created at ${mintAddress.publicKey.toBase58()}`);

            const associatedToken = getAssociatedTokenAddressSync(
                mintAddress.publicKey,
                wallet.publicKey,
                false,
                TOKEN_2022_PROGRAM_ID
            );

            console.log(associatedToken.toBase58());

            const transaction2 = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    wallet.publicKey,
                    associatedToken,
                    wallet.publicKey,
                    mintAddress.publicKey,
                    TOKEN_2022_PROGRAM_ID,
                ),
            );
    
            await wallet.sendTransaction(transaction2, connection);

            const transaction3 = new Transaction().add(
                createMintToInstruction(mintAddress.publicKey, associatedToken, wallet.publicKey, parseInt(initialSupply), [], TOKEN_2022_PROGRAM_ID)
            );
    
            await wallet.sendTransaction(transaction3, connection);
    
            console.log("Minted!")

        }   
    }


    return <div className="flex justify-center p-10">
        <div className="flex flex-col justify-center gap-3">
            <div>
                <Input placeholder={"Name"} onChange={(e) => {setName(e.target.value)}} />
            </div>

            <div>
                <Input placeholder={"Symbol"} onChange={(e) => {setSymbol(e.target.value)}} />
            </div>

            <div>
                <Input placeholder={"Decimals"} onChange={(e) => {setDecimals(e.target.value)}} />
            </div>

            <div>
                <Input placeholder={"Initial Supply"} onChange={(e) => {setInitialSupply(e.target.value)}} />
            </div>

            <div>
                <textarea placeholder="Description" typeof="text" className="border w-96 px-4 py-2" onChange={(e) => {setDescription(e.target.value)}} ></textarea>
            </div>

            <div>
                <FileUpload onFileSelect={(file) => {setImage(file)}} />
            </div>

            <div className="flex justify-center mt-8">   
                <div className="bg-black text-white px-8 py-3 rounded font-semibold">
                    <button onClick={handleClick}>Create token</button>
                </div>
            </div> 
        </div>
    </div>
}

