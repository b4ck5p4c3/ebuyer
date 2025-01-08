import {z} from "zod";
import {DefaultDialogProps, ItemDTO} from "@/lib/types";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {getClient, R} from "@/lib/api/client";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {ITEMS_QUERY_KEY} from "@/lib/cache-tags";
import React, {useEffect} from "react";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Form, FormControl, FormField, FormItem, FormMessage} from "@/components/ui/form";
import {Slider} from "@/components/ui/slider";
import {Button} from "@/components/ui/button";

const updateBoughtDialogForm = z.object({
    additionalBoughtCount: z.number()
});

type UpdateBoughtDialogData = z.infer<typeof updateBoughtDialogForm>;

export function UpdateBoughtDialog({open, onClose, item, shopId}: DefaultDialogProps & { item: ItemDTO, shopId: string }) {
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