import {ItemDetailsDTO} from "@/lib/types";
import {ReactNode} from "react";
import {ChipdipParserFormField} from "@/components/integrations/chipdip/parser";
import {RadetaliParserFormField} from "@/components/integrations/radetali/parser";
import {KrepkomParserFormField} from "@/components/integrations/krepkom/parser";

export interface ParserIntegrationProps {
    onParse: (details: ItemDetailsDTO) => void;
}

interface Integration {
    parser?: (props: ParserIntegrationProps) => ReactNode
}

export const INTEGRATIONS: Record<string, Integration> = {
    "chipdip": {
        parser: ChipdipParserFormField
    },
    "radetali": {
        parser: RadetaliParserFormField
    },
    "krepkom": {
        parser: KrepkomParserFormField
    }
};