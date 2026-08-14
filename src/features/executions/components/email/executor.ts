import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { Resend } from "resend";
import type { NodeExecutor } from "@/features/executions/types";
import { emailChannel } from "@/inngest/channels/email";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type EmailData = {
  credentialId?: string;
  to?: string;
  subject?: string;
  body?: string;
};

export const emailExecutor: NodeExecutor<EmailData> = async ({
  data,
  context,
  nodeId,
  userId,
  step,
  publish,
}) => {
  await publish(
    emailChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  if (!data.credentialId) {
    await publish(
      emailChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Email node: Resend credential is required");
  }

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({
      where: {
        id: data.credentialId,
        userId,
      },
    });
  });

  if (!credential) {
    await publish(
      emailChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Email node: Credential not found");
  }

  const to = data.to ? Handlebars.compile(data.to)(context) : "";
  const subject = data.subject ? Handlebars.compile(data.subject)(context) : "";
  const html = data.body ? Handlebars.compile(data.body)(context) : "";

  if (!to || !subject || !html) {
    await publish(
      emailChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      "Email node: To, Subject, and Body are required fields.",
    );
  }

  try {
    const emailId = await step.run("send-email", async () => {
      const resend = new Resend(decrypt(credential.value));

      const response = await resend.emails.send({
        from: "onboarding@resend.dev",
        to,
        subject,
        html,
      });

      if (response.error) {
        throw new NonRetriableError(
          `Resend API Error: ${response.error.message}`,
        );
      }

      return response.data?.id;
    });

    await publish(
      emailChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return {
      ...context,
      [nodeId]: {
        id: emailId,
      },
    };
  } catch (error) {
    await publish(
      emailChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
