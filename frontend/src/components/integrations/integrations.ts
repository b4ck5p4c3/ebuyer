import {ItemDetailsDTO} from "@/lib/types";
import React from "react";
import {ChipdipParserFormField} from "@/components/integrations/chipdip/parser";

export interface ParserIntegrationProps {
    onParse: (details: ItemDetailsDTO) => void;
}

interface Integration {
    parser?: React.FC<ParserIntegrationProps>
}

export const INTEGRATIONS: Record<string, Integration> = {
    "chipdip": {
        parser: ChipdipParserFormField
    }
};