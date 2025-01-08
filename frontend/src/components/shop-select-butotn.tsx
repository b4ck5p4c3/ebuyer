import {ShopDTO} from "@/lib/types";
import {usePathname, useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";

export function ShopSelectButton({shop}: { shop: ShopDTO }) {
    const path = usePathname();
    const router = useRouter();

    return <Button variant={path === `/shops/${shop.internalId}` ? "secondary" : "ghost"}
                   className={"justify-start"}
                   onClick={() => router.push(`/shops/${shop.internalId}`)}>
        {shop.name}
    </Button>;
}