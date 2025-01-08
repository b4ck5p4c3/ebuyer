import {z} from "zod";
import {DefaultDialogProps} from "@/lib/types";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {getClient, R} from "@/lib/api/client";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {ITEMS_QUERY_KEY} from "@/lib/cache-tags";
import React, {useEffect} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {INTEGRATIONS} from "@/components/integrations/integrations";
import {Separator} from "@/components/ui/separator";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";

const addItemDialogForm = z.object({
    title: z.string().nonempty(),

    sku: z.string().optional(),
    imageUrl: z.string().url().optional(),
    itemUrl: z.string().url().optional(),
    price: z.string().regex(/^(-?)(\d+)((\.(\d+))?)$/ig, {
        message: "Amount should be number"
    }).optional(),

    comment: z.string().optional(),
    requiredCount: z.number().int().gte(1)
});

type AddItemDialogData = z.infer<typeof addItemDialogForm>;

export function AddItemDialog({shopId, open, onClose}: DefaultDialogProps & { shopId: string }) {
    const form = useForm<AddItemDialogData>({
        resolver: zodResolver(addItemDialogForm)
    });

    const client = getClient();

    const queryClient = useQueryClient();

    const addItem = useMutation({
        mutationFn: async (data: AddItemDialogData) => {
            R(await client.POST("/api/items", {
                body: {
                    shopInternalId: shopId,

                    title: data.title,

                    sku: data.sku,
                    imageUrl: data.imageUrl,
                    itemUrl: data.itemUrl,
                    price: data.price,

                    comment: data.comment,
                    requiredCount: data.requiredCount
                }
            }));
        },
        onSuccess: async () => {
            onClose();
            await queryClient.refetchQueries({queryKey: [ITEMS_QUERY_KEY, shopId]})
        }
    });

    function onOpenChange(open: boolean) {
        if (!open && !addItem.isPending) {
            onClose();
        }
    }

    useEffect(() => {
        if (open) {
            form.reset({
                title: "",

                sku: undefined,
                imageUrl: undefined,
                itemUrl: undefined,
                price: undefined,

                comment: undefined,
                requiredCount: 0
            });
        }
    }, [open, form]);

    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>New item</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(data => addItem.mutate(data))}>
                    <div className={"flex flex-col gap-4 mb-4"}>
                        {
                            // @ts-expect-error WUT?
                            INTEGRATIONS[shopId]?.parser ? <>
                                {INTEGRATIONS[shopId].parser({
                                    onParse: (details) => {
                                        if (details.title) {
                                            form.setValue("title", details.title);
                                        }
                                        if (details.sku) {
                                            form.setValue("sku", details.sku);
                                        }
                                        if (details.imageUrl) {
                                            form.setValue("imageUrl", details.imageUrl);
                                        }
                                        if (details.itemUrl) {
                                            form.setValue("itemUrl", details.itemUrl);
                                        }
                                        if (details.price) {
                                            form.setValue("price", details.price);
                                        }
                                    }
                                })}
                                <Separator/></> : <></>
                        }
                        <FormField
                            control={form.control}
                            name="title"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>
                                        Title
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder={"Thing rev. 2"} disabled={addItem.isPending} {...field}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <Separator/>
                        <FormField
                            control={form.control}
                            name="sku"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>
                                        SKU
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder={"1337008"} disabled={addItem.isPending}
                                               value={field.value ?? ""}
                                               onChange={event => field.onChange(event.target.value || undefined)}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>
                                        Image URL
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder={"http://example.com/image.png"}
                                               disabled={addItem.isPending}
                                               value={field.value ?? ""}
                                               onChange={event => field.onChange(event.target.value || undefined)}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="itemUrl"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>
                                        Item URL
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder={"http://example.com/thing-rev-2"}
                                               disabled={addItem.isPending}
                                               value={field.value ?? ""}
                                               onChange={event => field.onChange(event.target.value || undefined)}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="price"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>
                                        Price
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder={"10.00"} disabled={addItem.isPending}
                                               value={field.value ?? ""}
                                               onChange={event => field.onChange(event.target.value || undefined)}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <Separator/>
                        <FormField
                            control={form.control}
                            name="comment"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>
                                        Comment
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea placeholder={"..."} disabled={addItem.isPending}
                                                  value={field.value ?? ""}
                                                  onChange={event => field.onChange(event.target.value || undefined)}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="requiredCount"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>
                                        Count
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder={"10"} type={"number"} disabled={addItem.isPending}
                                               value={field.value.toString()}
                                               onChange={event => field.onChange(parseInt(event.target.value || "0"))}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>
                    <DialogFooter>
                        <Button type={"submit"} disabled={addItem.isPending}>Add</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>;
}