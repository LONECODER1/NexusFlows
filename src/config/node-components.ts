import { InitialNode } from "@/components/initial-node";
import { NodeType } from "@/generated/prisma";
import type { NodeTypes } from "@xyflow/react";

import { HttpRequestNode } from "@/features/executions/components/http-request/node";
import { ManualTriggerNode } from "@/features/triggers/components/manual-trigger/node";
import { ScheduleTriggerNode } from "@/features/triggers/components/schedule-trigger/node";
import { GoogleFormTrigger } from "@/features/triggers/components/google-form-trigger/node";
import { StripeTriggerNode } from "@/features/triggers/components/stripe-trigger/node";
import { GeminiNode } from "@/features/executions/components/gemini/node";
import { GroqNode } from "@/features/executions/components/groq/node";
import { OpenAiNode } from "@/features/executions/components/openai/node";
import { AnthropicNode } from "@/features/executions/components/anthropic/node";
import { DiscordNode } from "@/features/executions/components/discord/node";
import { SlackNode } from "@/features/executions/components/slack/node";
import { IfElseNode } from "@/features/executions/components/if-else/node";
import { EmailNode } from "@/features/executions/components/email/node";
import { JavaScriptNode } from "@/features/executions/components/javascript/node";
import { TelegramNode } from "@/features/executions/components/telegram/node";
import { SwitchNode } from "@/features/executions/components/switch/node";

export const nodeComponents = {
    [NodeType.INITIAL]: InitialNode,
    [NodeType.HTTP_REQUEST]: HttpRequestNode,
    [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
    [NodeType.SCHEDULE_TRIGGER]: ScheduleTriggerNode,
    [NodeType.GOOGLE_FORM_TRIGGER]: GoogleFormTrigger,
    [NodeType.STRIPE_TRIGGER]: StripeTriggerNode,
    [NodeType.GEMINI]: GeminiNode,
    [NodeType.GROQ]: GroqNode,
    [NodeType.OPENAI]: OpenAiNode,
    [NodeType.ANTHROPIC]: AnthropicNode,
    [NodeType.DISCORD]: DiscordNode,
    [NodeType.SLACK]: SlackNode,
    [NodeType.IF_ELSE]: IfElseNode,
    [NodeType.EMAIL]: EmailNode,
    [NodeType.JAVASCRIPT]: JavaScriptNode,
    [NodeType.TELEGRAM]: TelegramNode,
    [NodeType.SWITCH]: SwitchNode,
} as const satisfies NodeTypes;

export type RegisteredNodeType = keyof typeof nodeComponents;