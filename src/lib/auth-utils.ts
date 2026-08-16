import { redirect } from "next/navigation";
import { getServerSession } from "./auth-session";

export const requireAuth = async () => {
    const session = await getServerSession();

    if (!session) {
        redirect("/login");
    }

    return session;
};

export const requireUnauth = async () => {
    const session = await getServerSession();

    if (session) {
        redirect("/workflows");
    }
};