"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { generateGoogleFormScript } from "./utils";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const GoogleFormTriggerDialog = ({
    open,
    onOpenChange
}: Props) => {
    const params = useParams();
    const workflowId = params.workflowId as string;

    // Construct the webhook URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const webhookUrl =
        `${baseUrl}/api/webhooks/google-form?workflowId=${workflowId}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(webhookUrl);
            toast.success("Webhook URL copied to clipboard");
        } catch {
            toast.error("Failed to copy URL");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Google Form Trigger Configuration</DialogTitle>
                    <DialogDescription>
                        Use this webhook URL in your Google Form's Apps Script to trigger
                        this workflow when a form is submitted.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="webhook-url">
                            Webhook URL
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="webhook-url"
                                value={webhookUrl}
                                readOnly
                                className="font-mono text-sm"
                            />
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={copyToClipboard}
                            >
                                <CopyIcon className="size-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-lg bg-muted p-4 space-y-2">
                        <h4 className="font-medium text-sm">Setup instructions:</h4>
                        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                            <li>Open your Google Form</li>
                            <li>Click the three dots menu → Script editor</li>
                            <li>Copy and paste the script below</li>
                            <li>Replace WEBHOOK_URL with your webhook URL above</li>
                            <li>Save and click "Triggers" → Add Trigger</li>
                            <li>Choose: From form → On form submit → Save</li>
                        </ol>
                    </div>

                    <div className="rounded-lg bg-muted p-4 space-y-3">
                        <h4 className="font-medium text-sm">Google Apps Script:</h4>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                                const script = generateGoogleFormScript(webhookUrl);
                                try {
                                    await navigator.clipboard.writeText(script);
                                    toast.success("Script copied to clipboard");
                                } catch {
                                    toast.error("Failed to copy Script to clipboard");
                                }
                            }}
                        >
                            <CopyIcon className="size-4 mr-2" />
                            Copy Google Apps Script
                        </Button>
                        <p className="text-xs text-muted-foreground">
                            This script includes your webhook URL and handles form submissions
                        </p>
                    </div>

                    <div className="rounded-lg bg-muted p-4 space-y-2">
                        <h4 className="font-medium text-sm">Available Variables</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{googleForm.respondentEmail}}"}
                                </code>
                                - Respondent's email
                            </li>
                            <li>
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{googleForm.responses['Question Name']}}"}
                                </code>
                                - Specific answer
                            </li>
                            <li>
                                <code className="bg-background px-1 py-0.5 rounded">
                                    {"{{json googleForm.responses}}"}
                                </code>{" "}
                                - All responses as JSON
                            </li>
                        </ul>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};