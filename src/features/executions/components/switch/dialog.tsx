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
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
    variableName: z
        .string()
        .min(1, { message: "Variable name is required" })
        .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
            message: "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
        }),
    propertyToCompare: z.string().min(1, "Property to compare is required"),
    case1Value: z.string().min(1, "Case 1 value is required"),
    case2Value: z.string().min(1, "Case 2 value is required"),
    case3Value: z.string().min(1, "Case 3 value is required"),
});

export type SwitchFormValues = z.infer<typeof formSchema>;

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<SwitchFormValues>;
}

export const SwitchDialog = ({
    open,
    onOpenChange,
    onSubmit,
    defaultValues = {},
}: Props) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            variableName: defaultValues.variableName || "",
            propertyToCompare: defaultValues.propertyToCompare || "",
            case1Value: defaultValues.case1Value || "",
            case2Value: defaultValues.case2Value || "",
            case3Value: defaultValues.case3Value || "",
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                variableName: defaultValues.variableName || "",
                propertyToCompare: defaultValues.propertyToCompare || "",
                case1Value: defaultValues.case1Value || "",
                case2Value: defaultValues.case2Value || "",
                case3Value: defaultValues.case3Value || "",
            });
        }
    }, [open, defaultValues, form]);

    const watchVariableName = form.watch("variableName") || "mySwitch";

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        onSubmit(values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Switch Configuration</DialogTitle>
                    <DialogDescription>
                        Compare a property against multiple values to route your workflow.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4 mt-2"
                    >
                        <FormField
                            control={form.control}
                            name="variableName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Variable Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="mySwitch"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Use this name to reference the result in other nodes:{" "}
                                        {`{{${watchVariableName}.matchedCase}}`}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="propertyToCompare"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Property to Compare</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="{{myGemini.text}}"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The value that will be evaluated against each case.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="case1Value"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Case 1 Value</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. approve"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="case2Value"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Case 2 Value</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. reject"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="case3Value"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Case 3 Value</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. review"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="mt-4">
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
