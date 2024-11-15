import { Client, Account, Databases } from "appwrite";

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') 
    .setProject('66ccea4d0006b240505c'); 

const account = new Account(client);
const databases = new Databases(client);


export { account,databases, client}