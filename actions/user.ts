"use server";
import * as sdk from 'node-appwrite'
import { parseStringify } from "@/lib/utils";
import axios from 'axios';
import { API_URL } from '@/environment';

const client = new sdk.Client()
    .setEndpoint('https://cloud.appwrite.io/v1') 
    .setProject('66ad2c76001c700ba8ae')
    .setKey('df9835b268e3a1f9f64f604b906b92097ac4c982ed68a2b92b2144541abb1c1f84b357c79adf6ee328a9bdcb92711b5ac96a87d3079f712a139034fd35dce5661419bb86c7590ce2d20925e090f88ce0acb8160eb24e22458771c0edba3c87b14a3ed383f9081a494a2972ae9ca79005c34a8de6aab321140383fee7611ca036')
    .setSession('')

const users = new sdk.Users(client);

export const getUser = async (userId:string) => {
    try {
      const user = await users.get(
        userId 
    );
      console.log({useri:user})
      return parseStringify(user);
    } catch (error) {
      console.error(
        "An error occurred while retrieving the user details:",
        error
      );
    }
  };

  export const getUserSessions = async(userId: string) => {
    try {
      const result = await axios.get(`${API_URL}/user/sessions/${userId}`)
      return result.data.data;
    } catch (error) {
      console.error(error)
    }
  }

  export const deleteUserSession = async (userId: string, sessionId: string) => {
    try {
      const result = await axios.post(`${API_URL}/user/session/delete/${userId}/${sessionId}`)
      return result.data.message;
    } catch (error: any) {
      console.error(error);
    }
  }

  export interface IUserSession {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    userId: string;
    expire: string;
    provider: string;
    providerUid: string;
    providerAccessToken: string;
    providerAccessTokenExpiry: string;
    providerRefreshToken: string;
    ip: string;
    osCode: string;
    osName: string;
    osVersion: string;
    clientEngine: string;
    clientEngineVersion: string;
    deviceName: string;
    deviceBrand: string;
    countryCode: string;
    countryName: string;
    clientName: string;
    clientType: string;
    current: string;
    factors: any[];
    secret: string;
    mfaUpdatedAt: string;
  }