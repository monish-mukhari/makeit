import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";


export function Appbar() {
    return <div className="flex justify-between py-2 px-12 border-b items-center">
        <div className="flex items-center">
            <div>
                <img src="https://www.pngall.com/wp-content/uploads/10/Solana-Crypto-Logo-Transparent.png" alt="appbar-logo" height={50} width={50} />
            </div>

            <div className="text-xl font-bold">
                Makeit
            </div>
        </div>

        <div>
            <WalletMultiButton />
        </div>
    </div>
}