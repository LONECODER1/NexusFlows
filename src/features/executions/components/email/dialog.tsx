"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { CredentialType } from "@/generated/prisma";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  credentialId: z.string().min(1, { message: "Credential is required" }),
  to: z.string().min(1, { message: "To address is required" }),
  subject: z.string().min(1, { message: "Subject is required" }),
  body: z.string().min(1, { message: "Email body is required" }),
});

export type EmailFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<EmailFormValues>;
}

export const EmailDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const { data: resendCredentials = [] } = useCredentialsByType(CredentialType.RESEND, open);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      credentialId: defaultValues.credentialId || "",
      to: defaultValues.to || "",
      subject: defaultValues.subject || "",
      body: defaultValues.body || "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        credentialId: defaultValues.credentialId || "",
        to: defaultValues.to || "",
        subject: defaultValues.subject || "",
        body: defaultValues.body || "",
      });
    }
  }, [open, defaultValues, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
          <DialogDescription>
            Configure the email to send via Resend. Saving here also saves the
            workflow so scheduled runs can send this email.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[70vh] overflow-y-auto pr-4">
            <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6 mt-4"
            >
                <FormField
                control={form.control}
                name="credentialId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Resend Credential</FormLabel>
                    <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                    >
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a credential" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {resendCredentials.map((credential) => (
                            <SelectItem key={credential.id} value={credential.id}>
                            {credential.name}
                            </SelectItem>
                        ))}
                        {resendCredentials.length === 0 && (
                            <SelectItem value="none" disabled>
                            No Resend credentials found
                            </SelectItem>
                        )}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="to"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>To</FormLabel>
                    <FormControl>
                        <Input
                        placeholder="e.g. client@example.com"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                        <Input
                        placeholder="e.g. Daily Market Summary"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Body (HTML / Text)</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="<h1>Summary</h1><p>Market is up!</p>"
                        className="font-mono text-sm min-h-[150px]"
                        {...field}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                <DialogFooter className="mt-4 pb-4">
                <Button type="submit">Save</Button>
                </DialogFooter>
            </form>
            </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
