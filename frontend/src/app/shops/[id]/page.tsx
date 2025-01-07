"use client";

import {useParams} from "next/navigation";
import {getClient, R} from "@/lib/api/client";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {ITEMS_QUERY_KEY} from "@/lib/cache-tags";
import {Button} from "@/components/ui/button";
import {Camera, Check, Plus, ReceiptRussianRuble, X} from "lucide-react";
import {Separator} from "@/components/ui/separator";
import {Skeleton} from "@/components/ui/skeleton";
import {DefaultDialogProps, ItemDTO} from "@/lib/types";
import Image from "next/image";
import okHand from "@/static/images/ok-hand.png";
import {Money} from "@/components/money";
import {moneyToDecimal} from "@/lib/money";
import Decimal from "decimal.js";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormLabel,
    FormMessage,
    FormItem
} from "@/components/ui/form";
import React, {useEffect, useState} from "react";
import {Slider} from "@/components/ui/slider";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";

function ItemImage({imageUrl}: { imageUrl?: string }) {
    return <div>
        {
            imageUrl ? <Image className={"rounded-md"} src={imageUrl} alt={"item-icon"} width={100} height={100}/> :
                <div className={"rounded-md bg-gray-200 h-[100px] w-[100px] flex items-center justify-center"}>
                    <Camera className={"h-10 w-10 text-gray-400"}/>
                </div>
        }
    </div>
}

const updateBoughtDialogForm = z.object({
    additionalBoughtCount: z.number()
});

type UpdateBoughtDialogData = z.infer<typeof updateBoughtDialogForm>;

function UpdateBoughtDialog({open, onClose, item, shopId}: DefaultDialogProps & { item: ItemDTO, shopId: string }) {
    const form = useForm<UpdateBoughtDialogData>({
        resolver: zodResolver(updateBoughtDialogForm)
    });

    const client = getClient();

    const queryClient = useQueryClient();

    const updateBoughtCount = useMutation({
        mutationFn: async (data: UpdateBoughtDialogData) => {
            R(await client.PATCH("/api/items/{itemId}/buy", {
                body: {
                    additionalBoughtCount: data.additionalBoughtCount
                },
                params: {
                    path: {
                        itemId: item.id
                    }
                }
            }));
        },
        onSuccess: async () => {
            onClose();
            await queryClient.refetchQueries({queryKey: [ITEMS_QUERY_KEY, shopId]})
        }
    });

    function onOpenChange(open: boolean) {
        if (!open && !updateBoughtCount.isPending) {
            onClose();
        }
    }

    useEffect(() => {
        if (open) {
            form.reset({
                additionalBoughtCount: 0
            });
        }
    }, [open, form]);

    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>I bought {item.title}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(data => updateBoughtCount.mutate(data))}>
                    <div className={"flex flex-col gap-4 mb-4"}>
                        <FormField
                            control={form.control}
                            name="additionalBoughtCount"
                            render={({field}) => (
                                <FormItem>
                                    <FormControl>
                                        <div className={"flex flex-row gap-5"}>
                                            <Slider disabled={updateBoughtCount.isPending}
                                                    defaultValue={[0]}
                                                    min={0}
                                                    max={item.requiredCount - item.boughtCount}
                                                    value={[field.value]}
                                                    onValueChange={(value => field.onChange(value[0]))}/>
                                            <div
                                                className={"min-w-10 text-right"}>{field.value}/{item.requiredCount - item.boughtCount}</div>
                                        </div>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>
                    <DialogFooter>
                        <Button type={"submit"} disabled={updateBoughtCount.isPending}>Update</Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>;
}

function ShopItem({item, shopId}: { item: ItemDTO, shopId: string }) {
    const [updateBoughtDialogOpened, setUpdateBoughtDialogOpened] = useState(false);

    const client = getClient();

    const queryClient = useQueryClient();

    const cancelItem = useMutation({
        mutationFn: async () => {
            R(await client.PATCH("/api/items/{itemId}/cancel", {
                params: {
                    path: {
                        itemId: item.id
                    }
                }
            }));
        },
        onSuccess: async () => {
            await queryClient.refetchQueries({queryKey: [ITEMS_QUERY_KEY, shopId]});
        }
    });

    const buyItemFully = useMutation({
        mutationFn: async () => {
            R(await client.PATCH("/api/items/{itemId}/buy", {
                params: {
                    path: {
                        itemId: item.id
                    }
                },
                body: {
                    additionalBoughtCount: item.requiredCount - item.boughtCount
                }
            }));
        },
        onSuccess: async () => {
            await queryClient.refetchQueries({queryKey: [ITEMS_QUERY_KEY, shopId]});
        }
    });

    return <div className={"border-gray-200 rounded-md border p-2 flex flex-row justify-between"}>
        <div className={"flex flex-row gap-4"}>
            <ItemImage imageUrl={item.imageUrl}/>
            <div className={"flex flex-col justify-between"}>
                <div className={"flex flex-col gap-2"}>
                    <div>{item.title}</div>
                    <div className={"text-xs"}>{item.comment ?? ""}</div>
                </div>
                {item.itemUrl ? <a href={item.itemUrl} className={"underline text-blue-700"}
                                   target={"_blank"}>{item.sku ?? "No SKU"}</a> : <div>{item.sku ?? "No SKU"}</div>}
            </div>
        </div>
        <div className={"flex flex-col justify-between items-end"}>
            {item.price ? <div className={"flex flex-col items-end"}>
                <div className={"text-sm"}>
                    <Money amount={item.price}/>&nbsp;x&nbsp;{item.requiredCount - item.boughtCount}&nbsp;=
                </div>
                <div className={"text-xl"}>
                    <Money amount={moneyToDecimal(item.price).mul(item.requiredCount - item.boughtCount)}/>
                </div>
            </div> : <div className={"text-xl"}>N/A</div>}
            <div className={"flex flex-row gap-5 items-center"}>
                <div className={"text-2xl"}>{item.boughtCount}/{item.requiredCount}</div>
                <div className={"flex flex-row gap-2"}>
                    <Button variant={"outline"} className={"w-10 h-10 p-0"}
                            disabled={cancelItem.isPending || buyItemFully.isPending}
                            onClick={() => setUpdateBoughtDialogOpened(true)}>
                        <ReceiptRussianRuble className={"w-6 h-6"}/>
                    </Button>
                    <Button className={"w-10 h-10 p-0"} disabled={cancelItem.isPending || buyItemFully.isPending}
                            onClick={() => buyItemFully.mutate()}>
                        <Check className={"w-6 h-6"}/>
                    </Button>
                    <Button variant={"destructive"} className={"w-10 h-10 p-0"}
                            disabled={cancelItem.isPending || buyItemFully.isPending}
                            onClick={() => cancelItem.mutate()}>
                        <X className={"w-6 h-6"}/>
                    </Button>
                </div>
            </div>
        </div>
        <UpdateBoughtDialog open={updateBoughtDialogOpened}
                            onClose={() => setUpdateBoughtDialogOpened(false)} item={item} shopId={shopId}/>
    </div>;
}

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

function AddItemDialog({shopId, open, onClose}: DefaultDialogProps & { shopId: string }) {
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
                        <FormItem>
                            <FormLabel>
                                URL to parse
                            </FormLabel>
                            <FormControl>
                                <div className={"flex flex-row gap-2"}>
                                    <Input placeholder={"https://chipdip.ru/product/1"}/>
                                    <Button>Parse</Button>
                                </div>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                        <Separator/>
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
                                               value={field.value ?? ""} onChange={event => field.onChange(event.target.value || undefined)}/>
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
                                               value={field.value ?? ""} onChange={event => field.onChange(event.target.value || undefined)}/>
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
                                               value={field.value ?? ""} onChange={event => field.onChange(event.target.value || undefined)}/>
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
                                               value={field.value ?? ""} onChange={event => field.onChange(event.target.value || undefined)}/>
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
                                            value={field.value ?? ""} onChange={event => field.onChange(event.target.value || undefined)}/>
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

export default function ShopPage() {
    const {id} = useParams<{ id: string }>();
    const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);

    const client = getClient();

    const items = useQuery({
        queryFn: async () => {
            const response = R(await client.GET("/api/items/shop/{shopInternalId}", {
                params: {
                    path: {
                        shopInternalId: id,
                    }
                }
            }));
            return response.data!;
        },
        retry: false,
        queryKey: [ITEMS_QUERY_KEY, id]
    });

    return <div className={"flex flex-col gap-5"}>
        <div className={"flex flex-row justify-between"}>
            <div><span className={"text-2xl"}>Items</span></div>
            <div><Button onClick={() => setAddItemDialogOpen(true)}><Plus className={"w-6 h-6"}/></Button></div>
        </div>
        <Separator/>
        <div className={"flex flex-col gap-2"}>
            {
                (!items.isFetching && items.data) ?
                    items.data.length === 0 ? <div className={"flex text-xl justify-center items-center"}>
                            No items to buy <Image src={okHand} alt={"ok-hand"} className={"w-8 h-8"}/>
                        </div> :
                        items.data.map(item => <ShopItem shopId={id} item={item} key={item.id}/>) :
                    <>
                        <Skeleton className={"w-full h-[118px]"}/>
                        <Skeleton className={"w-full h-[118px]"}/>
                    </>
            }
        </div>
        <div className={"flex flex-row justify-end text-2xl"}>
            {items.data ? <span>=&nbsp;<Money amount={items.data.map(item =>
                moneyToDecimal(item.price ?? 0).mul(item.requiredCount - item.boughtCount))
                .reduce((p, v) => p.add(v), new Decimal(0))}/></span> : <></>}
        </div>
        <AddItemDialog open={addItemDialogOpen} onClose={() => setAddItemDialogOpen(false)} shopId={id}/>
    </div>;
}