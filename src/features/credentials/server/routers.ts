import { db as prisma } from "@/lib/db";
import { createTRPCRouter, premiumProcedure, protectedProcedure } from "@/trpc/init";
import z from "zod";
import { PAGINATION } from "@/config/constants";
import { CredentialType } from "@/generated/prisma";
import { encrypt } from "@/lib/encryption";

const credentialListSelect = {
    id: true,
    name: true,
    type: true,
    createdAt: true,
    updatedAt: true,
} as const;

export const credentialsRouter = createTRPCRouter({
    create: premiumProcedure
        .input(
            z.object({
                name: z.string().min(1, "Name is required"),
                type: z.enum(CredentialType),
                value: z.string().min(1, "Value is required")
            })
        )
        .mutation(({ ctx, input }) => {
            const { name, value, type } = input;

            return prisma.credential.create({
                data: {
                    name,
                    userId: ctx.auth.user.id,
                    type,
                    value: encrypt(value),
                },
            });
        }),
    remove: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(({ ctx, input }) => {
            return prisma.credential.delete({
                where: {
                    id: input.id,
                    userId: ctx.auth.user.id,
                },
            })
        }),
    update: protectedProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(1, "Name is required"),
                type: z.enum(CredentialType),
                value: z.string().min(1, "Value is required"),
            }),
        )
        .mutation(({ ctx, input }) => {
            const { id, name, type, value } = input;

            return prisma.credential.update({
                where: { id, userId: ctx.auth.user.id },
                data: {
                    name,
                    type,
                    value: encrypt(value),
                }
            });
        }),
    getOne: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(({ ctx, input }) => {
            return prisma.credential.findUniqueOrThrow({
                where: { id: input.id, userId: ctx.auth.user.id },
            });
        }),
    getMany: protectedProcedure
        .input(
            z.object({
                page: z.number().default(PAGINATION.DEFAULT_PAGE),
                pageSize: z
                    .number()
                    .min(PAGINATION.MIN_PAGE_SIZE)
                    .max(PAGINATION.MAX_PAGE_SIZE)
                    .default(PAGINATION.DEFAULT_PAGE_SIZE),
                search: z.string().default(""),
            })
        )
        .query(async ({ ctx, input }) => {
            const { page, pageSize, search } = input;

            const [items, totalCount] = await Promise.all([
                prisma.credential.findMany({
                    skip: (page - 1) * pageSize,
                    take: pageSize,
                    where: {
                        userId: ctx.auth.user.id,
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    orderBy: {
                        updatedAt: "desc",
                    },
                    select: credentialListSelect,
                }),
                prisma.credential.count({
                    where: {
                        userId: ctx.auth.user.id,
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                }),
            ]);

            const totalPages = Math.ceil(totalCount / pageSize);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;

            return {
                items,
                page,
                pageSize,
                totalCount,
                totalPages,
                hasNextPage,
                hasPreviousPage,
            };
        }),
    getByType: protectedProcedure
        .input(
            z.object({
                type: z.enum(CredentialType),
            })
        )
        .query(({ input, ctx }) => {
            const { type } = input;

            return prisma.credential.findMany({
                where: { type, userId: ctx.auth.user.id },
                orderBy: {
                    updatedAt: "desc",
                },
                select: credentialListSelect,
            });
        }),
});