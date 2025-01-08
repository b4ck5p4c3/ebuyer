import {ItemDetailsDTO} from "@/lib/types";
import {FormControl, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import React, {useState} from "react";
import {getClient, R} from "@/lib/api/client";
import {useMutation} from "@tanstack/react-query";
import {ParserIntegrationProps} from "@/components/integrations/integrations";

export function KrepkomParserFormField({onParse}: ParserIntegrationProps) {
    const [url, setUrl] = useState("");

    const client = getClient();

    const parse = useMutation({
        mutationFn: async (url: string) => {
            const response = R(await client.POST("/api/integrations/krepkom/parse", {
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
                <Input placeholder={"https://krepcom.ru/catalog/shtangi-razdel/shpilka_rezbovaya_nerzhaveyushchaya_a2_din_975_m14x1000.htm"} value={url}
                       onChange={event => setUrl(event.target.value)}/>
                <Button onClick={() => parse.mutate(url)} disabled={parse.isPending} type={"button"}>Parse</Button>
            </div>
        </FormControl>
        <FormMessage/>
    </FormItem>;
}