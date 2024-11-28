"use server";
import * as sdk from 'node-appwrite'
import { parseStringify } from "@/lib/utils";
import axios from 'axios';
import { API_URL, APPWRITE_API_KEY, APPWRITE_PROJECT_ID } from '@/environment';

const client = new sdk.Client()
    .setEndpoint('https://cloud.appwrite.io/v1') 
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY)
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