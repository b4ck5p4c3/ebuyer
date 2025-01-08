"use client";

import React, {useEffect} from "react";
import {useQuery} from "@tanstack/react-query";
import {getClient, R} from "@/lib/api/client";
import {SHOPS_QUERY_KEY} from "@/lib/cache-tags";
import {Skeleton} from "@/components/ui/skeleton";
import {usePathname, useRouter} from "next/navigation";
import {ShopSelectButton} from "@/components/shop-select-butotn";

export default function ShopsLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
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
    }, [shops, path, router]);

    return (
        <div className={"2xl:w-9/12 2xl:m-auto 2xl:mt-5 sm:ml-10 sm:mr-10 ml-5 mr-5 flex lg:flex-row flex-col mt-5 gap-10"}>
            <div className={"lg:w-2/12 lg:flex lg:flex-col grid xs:grid-cols-3 grid-cols-2 gap-2"}>
                <span className={"text-2xl mb-3 lg:block hidden"}>Shops</span>
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
            <div className={"lg:w-10/12 flex flex-col gap-8 mb-10"}>
                {children}
            </div>
        </div>
    );
}