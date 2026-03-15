export const formatPrice = (price: number) : string => {
    return `${price.toLocaleString('fr-FR')} FCFA`;
};

export const formatPriceParts = (price:number)=> {
    return {
        amount : price.toLocaleString('fr - FR'),
        currency : 'FCFA',
        
    }
}

