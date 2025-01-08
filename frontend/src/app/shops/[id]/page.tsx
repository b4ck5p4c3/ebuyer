"use client";

import {useParams} from "next/navigation";
import {getClient, R} from "@/lib/api/client";
import {useQuery} from "@tanstack/react-query";
import {ITEMS_QUERY_KEY} from "@/lib/cache-tags";
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import {Separator} from "@/components/ui/separator";
import {Skeleton} from "@/components/ui/skeleton";
import Image from "next/image";
import okHand from "@/static/images/ok-hand.png";
import {Money} from "@/components/money";
import {moneyToDecimal} from "@/lib/money";
import Decimal from "decimal.js";
import React, {useState} from "react";
import {ShopItem} from "@/components/shop-item";
import {AddItemDialog} from "@/components/dialogs/add-item";

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
        <div className={"flex sm:flex-row flex-col justify-between"}>
            <div className={"sm:block hidden"}><span className={"text-2xl"}>Items</span></div>
            <div><Button className={"w-full"} onClick={() => setAddItemDialogOpen(true)}><Plus className={"w-6 h-6"}/></Button></div>
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