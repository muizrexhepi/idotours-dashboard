import { account } from "@/appwrite.config"
import { parseStringify } from "@/lib/utils";

export const useUser = async () => {
    try {
        const user = await account.get();
        return parseStringify(user);
    } catch (error) {
        return {message: "No user found", status: 401}
    }
};

