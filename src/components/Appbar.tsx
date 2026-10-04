import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function Appbar() {
  return (
    <header className="appbar">
      <a className="brand" href="#top" aria-label="Orbit home">
        <span className="brand-mark" aria-hidden="true"><span /><span /><span /></span>
        <span className="brand-wordmark">MINT/ROOM <span>01</span></span>
      </a>
      <div className="appbar-actions">
        <div className="network-pill" title="Tokens are created on Solana Devnet">
          <span className="status-dot" /><span className="network-copy">TEST PRESS</span> Solana Devnet
        </div>
        <WalletMultiButton />
      </div>
    </header>
  );
}
