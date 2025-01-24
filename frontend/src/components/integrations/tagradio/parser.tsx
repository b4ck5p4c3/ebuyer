import {ItemDetailsDTO} from "@/lib/types";
import {FormControl, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import React, {useState} from "react";
import {getClient, R} from "@/lib/api/client";
import {useMutation} from "@tanstack/react-query";
import {ParserIntegrationProps} from "@/components/integrations/integrations";

export function TagRadioParserFormField({onParse}: ParserIntegrationProps) {
    const [url, setUrl] = useState("");

    const client = getClient();

    const parse = useMutation({
        mutationFn: async (url: string) => {
            const response = R(await client.POST("/api/integrations/tagradio/parse", {
                body: {
                    url
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
            URL to parse
        </FormLabel>
        <FormControl>
            <div className={"flex flex-row gap-2"}>
                <Input placeholder={"https://taggsm.ru/index.php?route=product/product&path=13000001_11000002_10000058&product_id=128564"} value={url}
                       onChange={event => setUrl(event.target.value)}/>
                <Button onClick={() => parse.mutate(url)} disabled={parse.isPending} type={"button"}>Parse</Button>
            </div>
        </FormControl>
        <FormMessage/>
    </FormItem>;
}