import { Otp } from "./operator";

export interface User {
    name: string;
    email: string;
    otp: Otp;
    fcm_token: string;
    points: number;
};

export interface AppwriteUser {
    $id: string;
    email: string;
    phone: string;
    name: string;
    labels: string[];
}