import axios from 'axios';


export const uploadMetadata = async (metadata: object) => {
    try {
        const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinJSONToIPFS', 
            metadata, 
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_PINATA_JWT_TOKEN}`, 
                }
            }
        );

        const ipfsHash = response.data.IpfsHash;
        return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    } catch (error: any) {
        console.error('Error uploading metadata to IPFS:', error.response?.data || error.message);
        throw error;
    }
};


