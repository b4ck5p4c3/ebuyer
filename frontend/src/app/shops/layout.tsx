"use client";

import React, {use, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {useQuery} from "@tanstack/react-query";
import {getClient, R} from "@/lib/api/client";
import {SHOPS_QUERY_KEY} from "@/lib/cache-tags";
import {Skeleton} from "@/components/ui/skeleton";
import {usePathname, useRouter} from "next/navigation";
import {ShopDTO} from "@/lib/types";

function ShopSelectButton({shop}: { shop: ShopDTO }) {
    const path = usePathname();
    const router = useRouter();

    return <Button variant={path === `/shops/${shop.internalId}` ? "secondary" : "ghost"}
                   className={"justify-start"}
                   onClick={() => router.push(`/shops/${shop.internalId}`)}>
        {shop.name}
    </Button>;
}

export default function DashboardLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
    const client = getClient();

    const shops = useQuery({
        queryFn: async () => {
            const response = R(await client.GET("/api/shops", {}));
            return response.data!;
        },
        retry: false,
        queryKey: [SHOPS_QUERY_KEY]
    });

    const path = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (path === "/shops" && shops.data && shops.data.length > 0) {
            router.push(`/shops/${shops.data[0].internalId}`);
        }
    }, [shops]);

    return (
        <div className={"w-9/12 m-auto flex flex-row mt-5 gap-10"}>
            <div className={"w-2/12 flex flex-col gap-2"}>
                <span className={"text-2xl mb-3"}>Shops</span>
                {
                    shops.data ? shops.data.map(shop =>
                            <ShopSelectButton shop={shop} key={shop.id}/>
                        ) :
                        <>
                            <Skeleton className={"w-full h-[36px]"}/>
                            <Skeleton className={"w-full h-[36px]"}/>
                        </>
                }
            </div>
            <div className={"w-10/12 flex flex-col gap-8 mb-10"}>
                {children}
            </div>
        </div>
    );
}