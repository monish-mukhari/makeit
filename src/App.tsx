import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { Appbar } from './components/Appbar';
import '@solana/wallet-adapter-react-ui/styles.css';
import './App.css';
import './custom-wallet-styles.css';
import { TokenLaunchpad } from './components/TokenLaunchpad';

function App() {

  return (
    <div>
      <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>
            <Appbar />
            <TokenLaunchpad />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </div>
  )
}

export default App
