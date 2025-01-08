import {ItemDetailsDTO} from "@/lib/types";
import {FormControl, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import React, {useState} from "react";
import {getClient, R} from "@/lib/api/client";
import {useMutation} from "@tanstack/react-query";
import {ParserIntegrationProps} from "@/app/shops/[id]/page";

export function ChipdipParserFormField({onParse}: ParserIntegrationProps) {
    const [data, setData] = useState("");

    const client = getClient();

    const parse = useMutation({
        mutationFn: async (data: string) => {
            const response = R(await client.POST("/api/integrations/chipdip/parse", {
                body: {
                    data
                }
            }))
            return response.data!;
        },
        onSuccess: (data: ItemDetailsDTO) => {
            onParse(data);
        }
    });

    return <FormItem>
        <FormLabel>
            URL/SKU to parse
        </FormLabel>
        <FormControl>
            <div className={"flex flex-row gap-2"}>
                <Input placeholder={"https://chipdip.ru/product/ch340g"} value={data}
                       onChange={event => setData(event.target.value)}/>
                <Button onClick={() => parse.mutate(data)} disabled={parse.isPending} type={"button"}>Parse</Button>
            </div>
        </FormControl>
        <FormMessage/>
    </FormItem>;
}