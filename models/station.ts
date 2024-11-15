import { Operator } from "./operator";

export interface Station {
    _id?:string;
    name: string;
    city: string;
    country: string;
    address: string;
    location: {
        lat: number | undefined;
        lng: number | undefined;
    };
    code: string;
    operator?: Operator | string;
}

