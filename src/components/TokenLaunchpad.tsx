import { useMemo, useState } from "react";
import FileUpload from "../ui/FileUpload";
import { uploadImage } from "../utils/UploadImage";
import { generateMetadata } from "../utils/GenerateMetadata";
import { uploadMetadata } from "../utils/UploadMetadata";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { createAssociatedTokenAccountInstruction, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, createMintToInstruction, ExtensionType, getAssociatedTokenAddressSync, getMintLen, LENGTH_SIZE, TOKEN_2022_PROGRAM_ID, TYPE_SIZE } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import { generateSubMetadata } from "../utils/GenerateSubMetadata";

type LaunchState = "idle" | "uploading" | "creating" | "minting" | "success" | "error";
const ArrowIcon = () => <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" /></svg>;

export function TokenLaunchpad() {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState("9");
  const [initialSupply, setInitialSupply] = useState("1000000");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [launchState, setLaunchState] = useState<LaunchState>("idle");
  const [message, setMessage] = useState("");
  const [mintAddress, setMintAddress] = useState("");
  const wallet = useWallet();
  const { connection } = useConnection();

  const formattedSupply = useMemo(() => {
    const supply = Number(initialSupply);
    return Number.isFinite(supply) ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(supply) : "0";
  }, [initialSupply]);

  const isValid = Boolean(name.trim() && symbol.trim() && image && description.trim() &&
    Number.isInteger(Number(decimals)) && Number(decimals) >= 0 && Number(decimals) <= 9 && Number(initialSupply) > 0);
  const isBusy = ["uploading", "creating", "minting"].includes(launchState);

  const handleImage = (file: File | null) => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleClick = async () => {
    if (!wallet.publicKey) {
      setLaunchState("error");
      setMessage("Connect a wallet before launching your token.");
      return;
    }
    if (!isValid || !image) {
      setLaunchState("error");
      setMessage("Complete each field and add token artwork to continue.");
      return;
    }
    try {
      setMessage("");
      setLaunchState("uploading");
      const mint = Keypair.generate();
      const imageUrl = await uploadImage(image);
      const subMetadata = await generateSubMetadata(name.trim(), symbol.trim().toUpperCase(), description.trim(), imageUrl);
      const metadataUri = await uploadMetadata(subMetadata);
      const metadata = generateMetadata(mint.publicKey, name.trim(), symbol.trim().toUpperCase(), metadataUri);

      setLaunchState("creating");
      const mintLen = getMintLen([ExtensionType.MetadataPointer]);
      const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
      const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);
      const transaction = new Transaction().add(
        SystemProgram.createAccount({ fromPubkey: wallet.publicKey, newAccountPubkey: mint.publicKey, lamports, space: mintLen, programId: TOKEN_2022_PROGRAM_ID }),
        createInitializeMetadataPointerInstruction(mint.publicKey, wallet.publicKey, mint.publicKey, TOKEN_2022_PROGRAM_ID),
        createInitializeMintInstruction(mint.publicKey, Number(decimals), wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
        createInitializeInstruction({ programId: TOKEN_2022_PROGRAM_ID, mint: mint.publicKey, metadata: mint.publicKey, name: metadata.name, symbol: metadata.symbol, uri: metadata.uri, mintAuthority: wallet.publicKey, updateAuthority: wallet.publicKey })
      );
      transaction.feePayer = wallet.publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      transaction.partialSign(mint);
      await wallet.sendTransaction(transaction, connection);

      setLaunchState("minting");
      const associatedToken = getAssociatedTokenAddressSync(mint.publicKey, wallet.publicKey, false, TOKEN_2022_PROGRAM_ID);
      await wallet.sendTransaction(new Transaction().add(
        createAssociatedTokenAccountInstruction(wallet.publicKey, associatedToken, wallet.publicKey, mint.publicKey, TOKEN_2022_PROGRAM_ID)
      ), connection);
      const baseUnits = BigInt(Math.round(Number(initialSupply) * (10 ** Number(decimals))));
      await wallet.sendTransaction(new Transaction().add(
        createMintToInstruction(mint.publicKey, associatedToken, wallet.publicKey, baseUnits, [], TOKEN_2022_PROGRAM_ID)
      ), connection);
      setMintAddress(mint.publicKey.toBase58());
      setLaunchState("success");
      setMessage("Your Token-2022 mint is live on Solana Devnet.");
    } catch (error) {
      setLaunchState("error");
      setMessage(error instanceof Error ? error.message : "Launch cancelled or failed. Please try again.");
    }
  };

  const statusLabel: Record<LaunchState, string> = {
    idle: "Launch token", uploading: "Uploading metadata…", creating: "Creating mint…", minting: "Minting supply…", success: "Token launched", error: "Try launch again"
  };

  return (
    <main id="top">
      <section className="hero-shell">
        <div className="hero-copy">
          <div className="eyebrow"><span /> Independent digital mint / Solana</div>
          <h1>Press something<br /><em>the chain remembers.</em></h1>
          <p>A small-batch minting room for original tokens. Define the object, set its circulation, then sign the first edition into existence.</p>
          <div className="hero-proof">
            <div><strong>01 / Compose</strong><span>Name the object</span></div>
            <div><strong>02 / Edition</strong><span>Choose circulation</span></div>
            <div><strong>03 / Press</strong><span>Sign it on-chain</span></div>
          </div>
        </div>
        <div className="orbit-visual" aria-hidden="true">
          <div className="specimen-index">OBJECT<br />№ 2022</div>
          <img className="mint-specimen" src="/assets/mint-specimen.png" alt="Iridescent machined token specimen" />
          <div className="orbit-label label-one">MATERIAL: TOKEN-2022</div><div className="orbit-label label-two">STATE: UNPRESSED</div><div className="orbit-label label-three">AUTHORITY: YOU</div>
        </div>
      </section>

      <section className="launch-section" aria-labelledby="launch-heading">
        <div className="section-heading">
          <div><span className="section-number">A</span><h2 id="launch-heading">Set the press</h2></div>
          <p>Every field becomes part of the edition. Review the proof at right before you commit it to Devnet.</p>
        </div>
        <div className="launch-grid">
          <aside className="steps-card">
            <span className="steps-kicker">Press sequence</span>
            <div className="step active"><span>01</span><div><strong>Token details</strong><small>Name, ticker & story</small></div></div>
            <div className={`step ${image ? "complete" : ""}`}><span>02</span><div><strong>Visual identity</strong><small>Token artwork</small></div></div>
            <div className={`step ${isValid ? "complete" : ""}`}><span>03</span><div><strong>Supply setup</strong><small>Decimals & allocation</small></div></div>
            <div className={`step ${launchState === "success" ? "complete" : ""}`}><span>04</span><div><strong>Sign & launch</strong><small>Confirm in wallet</small></div></div>
            <div className="devnet-note"><span className="status-dot" /><p><strong>Safe to explore</strong>This launchpad uses Solana Devnet. Tokens have no real-world value.</p></div>
          </aside>

          <div className="form-card">
            <div className="form-block">
              <div className="block-title"><span>01</span><div><h3>Token details</h3><p>Give your token a recognizable identity.</p></div></div>
              <div className="field-row">
                <label className="field"><span>Token name</span><input value={name} maxLength={32} onChange={(e) => setName(e.target.value)} placeholder="e.g. Orbit Protocol" /><small>{name.length}/32</small></label>
                <label className="field symbol-field"><span>Symbol</span><input value={symbol} maxLength={8} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="ORBT" /><small>{symbol.length}/8</small></label>
              </div>
              <label className="field"><span>Description</span><textarea value={description} maxLength={280} onChange={(e) => setDescription(e.target.value)} placeholder="What makes your token worth discovering?" /><small>{description.length}/280</small></label>
            </div>

            <div className="form-block">
              <div className="block-title"><span>02</span><div><h3>Visual identity</h3><p>Square artwork works best across wallets and explorers.</p></div></div>
              <FileUpload onFileSelect={handleImage} />
            </div>

            <div className="form-block">
              <div className="block-title"><span>03</span><div><h3>Supply setup</h3><p>Define how your token divides and launches.</p></div></div>
              <div className="field-row">
                <label className="field"><span>Initial supply</span><input value={initialSupply} inputMode="decimal" onChange={(e) => setInitialSupply(e.target.value.replace(/[^0-9.]/g, ""))} /><small>Tokens sent to your wallet</small></label>
                <label className="field"><span>Decimals</span><input value={decimals} inputMode="numeric" min="0" max="9" type="number" onChange={(e) => setDecimals(e.target.value)} /><small>9 is standard on Solana</small></label>
              </div>
            </div>
          </div>

          <aside className="preview-column">
            <div className="preview-card">
              <div className="preview-top"><span>Edition proof</span><span className="token-standard">UNPRESSED</span></div>
              <div className={`token-art ${preview ? "has-image" : ""}`}>
                {preview ? <img src={preview} alt="" /> : <><div className="mini-orbit" /><span>{symbol.slice(0, 2).toUpperCase() || "OR"}</span></>}
              </div>
              <div className="token-heading"><div><h3>{name || "Your token"}</h3><span>${symbol || "SYMBOL"}</span></div><span className="verified-mark">✓</span></div>
              <p className="preview-description">{description || "Your token description will appear here as you type."}</p>
              <div className="token-stats"><div><span>Initial supply</span><strong>{formattedSupply}</strong></div><div><span>Decimals</span><strong>{decimals || "0"}</strong></div><div><span>Network</span><strong><i /> Devnet</strong></div></div>
            </div>
            <div className="launch-card">
              <div className="launch-summary"><span>Ready to launch?</span><strong>{wallet.connected ? "Wallet connected" : "Connect wallet first"}</strong></div>
              <button className="launch-button" onClick={handleClick} disabled={isBusy || (!isValid && wallet.connected)}><span>{statusLabel[launchState]}</span><ArrowIcon /></button>
              <p>By launching, you’ll approve up to 3 transactions for the mint, token account, and initial supply.</p>
              {message && <div className={`notice ${launchState}`} role="status"><span>{launchState === "success" ? "✓" : "!"}</span><div>{message}{mintAddress && <a href={`https://explorer.solana.com/address/${mintAddress}?cluster=devnet`} target="_blank" rel="noreferrer">View on Solana Explorer ↗</a>}</div></div>}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
