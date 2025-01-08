import {ItemDTO} from "@/lib/types";
import React, {useState} from "react";
import {getClient, R} from "@/lib/api/client";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {ITEMS_QUERY_KEY} from "@/lib/cache-tags";
import {ItemImage} from "@/components/item-image";
import {Money} from "@/components/money";
import {moneyToDecimal} from "@/lib/money";
import {Button} from "@/components/ui/button";
import {Check, ReceiptRussianRuble, X} from "lucide-react";
import {UpdateBoughtDialog} from "@/components/dialogs/update-bought";

export function ShopItem({item, shopId}: { item: ItemDTO, shopId: string }) {
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

    return <div className={"border-gray-200 rounded-md border p-2 flex md:flex-row flex-col justify-between md:gap-0 gap-5"}>
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
        <div className={"flex flex-col justify-between items-end min-h-[100px]"}>
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
