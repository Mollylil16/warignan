
//enum: permet de lister soit tes liste d'objets par categorie, statut, prix etc...; il peut permettre aussi la liste des prix
export enum ProductCategory {
    ROBE = 'robe',
    CROP = 'crop',
}

export enum ProductStatus {
    DISPONIBLE = 'disponible',
    RESERVER = 'reserver',
    SOLD = 'sold',
}


export interface Product {
    id: string;
    code : string;
    nom : string;
    description : string;
    prix : number;
    category : ProductCategory; 
    status : ProductStatus;
    createdAt :string;
    imageName : string[];
    stock : number;

}

export interface productFilters {
    category : 'ALL' | 'ROBE' | 'CROP';
    sortBy : 'price-asc' |'price-desc' | 'popular' | 'newest' | 'oldest';
    maxPrice : number;
}
