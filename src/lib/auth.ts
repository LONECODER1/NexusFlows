import { checkout, polar, portal } from "@polar-sh/better-auth";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db as prisma } from "@/lib/db";
import { getTrialEndDate } from "@/features/subscriptions/lib/trial";
import { polarClient } from "./polar";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    user: {
        additionalFields: {
            trialEndsAt: {
                type: "date",
                required: false,
                input: false,
            },
        },
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    return {
                        data: {
                            ...user,
                            trialEndsAt: getTrialEndDate(),
                        },
                    };
                },
            },
        },
    },
    baseURL:
        process.env.BETTER_AUTH_URL ||
        (process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
            : process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : undefined),
    trustedOrigins: async (request) => {
        const origins: string[] = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://nexus-flows-pi.vercel.app",
            "https://*.vercel.app",
        ];

        if (process.env.BETTER_AUTH_URL) origins.push(process.env.BETTER_AUTH_URL);
        if (process.env.NEXT_PUBLIC_APP_URL) origins.push(process.env.NEXT_PUBLIC_APP_URL);
        if (process.env.VERCEL_URL) origins.push(`https://${process.env.VERCEL_URL}`);
        if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
            origins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
        }

        if (request) {
            const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
            const proto = request.headers.get("x-forwarded-proto") || "https";

            if (host) {
                origins.push(`${proto}://${host}`);
                origins.push(`https://${host}`);
                origins.push(`http://${host}`);
            }

            const origin = request.headers.get("origin");
            if (origin) {
                try {
                    const originHost = new URL(origin).host;
                    if (host && originHost === host) {
                        origins.push(origin);
                    }
                } catch {}
            }

            const referer = request.headers.get("referer");
            if (referer) {
                try {
                    const refererUrl = new URL(referer);
                    if (host && refererUrl.host === host) {
                        origins.push(refererUrl.origin);
                    }
                } catch {}
            }
        }

        // Sanitize: remove any trailing slashes and falsy values
        return Array.from(
            new Set(origins.filter(Boolean).map((o) => o.replace(/\/+$/, ""))),
        );
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    plugins: [
        polar({
            client: polarClient,
            createCustomerOnSignUp: true,
            use: [
                checkout({
                    products: [
                        {
                            productId: "5bcaa07c-2db9-4cc0-85d1-31237179f638",
                            slug: "marstech",
                        }
                    ],
                    successUrl: process.env.POLAR_SUCCESS_URL,
                    authenticatedUsersOnly: true,
                }),
                portal(),
            ],
        })
    ]
});