import { account } from "@/appwrite.config";
import { OAuthProvider } from "appwrite";

export async function handleGoogleLogin() {
    account.createOAuth2Session(
      OAuthProvider.Google,
      "http://localhost:3000",
      "http://localhost:3000/fail"
    );
  }

export async function handleFacebookLogin() {
    account.createOAuth2Session(
      OAuthProvider.Facebook,
      "http://localhost:3000",
      "http://localhost:3000/fail"
    );
  }