

export const generateSubMetadata = (name: string, symbol: string, description: string, imageUrl: string) => {
    return {
        name,
        symbol, 
        description,
        image: imageUrl
    }
}