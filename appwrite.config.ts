import { Client, Account, Databases } from "appwrite";
import { APPWRITE_PROJECT_ID } from "./environment";

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') 
    .setProject(APPWRITE_PROJECT_ID); 

const account = new Account(client);
const databases = new Databases(client);


export { account,databases, client}