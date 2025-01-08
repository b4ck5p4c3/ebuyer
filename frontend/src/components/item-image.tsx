import Image from "next/image";
import {Camera} from "lucide-react";
import React from "react";

export function ItemImage({imageUrl}: { imageUrl?: string }) {
    return <div className={"min-w-[100px] min-h-[100px] flex justify-center items-center"}>
        {
            imageUrl ? <Image className={"rounded-md"} src={imageUrl} alt={"item-icon"} width={100} height={100}/> :
                <div className={"rounded-md bg-gray-200 h-[100px] w-[100px] flex items-center justify-center"}>
                    <Camera className={"h-10 w-10 text-gray-400"}/>
                </div>
        }
    </div>
}