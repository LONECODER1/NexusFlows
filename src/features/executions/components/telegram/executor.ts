import Handlebars from "handlebars";
import { decode } from "html-entities";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import ky from "ky";

type TelegramData = {
  variableName?: string;
  botToken?: string;
  chatId?: string;
  content?: string;
};

export const telegramExecutor: NodeExecutor<TelegramData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  if (!data.content) {
    throw new NonRetriableError("Telegram node: Message content is required");
  }

  const rawContent = Handlebars.compile(data.content)(context);
  const content = decode(rawContent);

  try {
    const result = await step.run("telegram-send", async () => {
      if (!data.botToken) {
        throw new NonRetriableError("Telegram node: Bot Token is required");
      }
      if (!data.chatId) {
        throw new NonRetriableError("Telegram node: Chat ID is required");
      }

      const telegramUrl = `https://api.telegram.org/bot${data.botToken}/sendMessage`;

      await ky.post(telegramUrl, {
        json: {
          chat_id: data.chatId,
          text: content,
        },
      });

      if (!data.variableName) {
        throw new NonRetriableError("Telegram node: Variable name is missing");
      }

      return {
        ...context,
        [data.variableName]: {
          messageContent: content.slice(0, 4000),
          success: true,
        },
      };
    });

    return result;
  } catch (error) {
    throw error;
  }
};
