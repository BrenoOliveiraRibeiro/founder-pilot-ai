
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Globe, Target, RefreshCw, Sparkles } from "lucide-react";

interface MarketSizeFormProps {
  segment: string;
  setSegment: (value: string) => void;
  region: string;
  setRegion: (value: string) => void;
  customerType: string;
  setCustomerType: (value: string) => void;
  handleAnalyze: () => void;
  isLoading: boolean;
}

export const MarketSizeForm: React.FC<MarketSizeFormProps> = ({
  segment,
  setSegment,
  region,
  setRegion,
  customerType,
  setCustomerType,
  handleAnalyze,
  isLoading
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="segment" className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-blue-500" />
            Segmento de atuação
          </Label>
          <Input 
            id="segment" 
            placeholder="Ex: Fintech, Marketplace, SaaS B2B" 
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="region" className="flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-green-500" />
            Região geográfica
          </Label>
          <Input 
            id="region" 
            placeholder="Ex: Brasil, América Latina, SP Capital" 
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="customerType" className="flex items-center gap-1.5">
            <Target className="h-4 w-4 text-purple-500" />
            Tipo de cliente
          </Label>
          <Select 
            value={customerType} 
            onValueChange={setCustomerType}
          >
            <SelectTrigger id="customerType">
              <SelectValue placeholder="Selecione o tipo de cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="B2B">B2B</SelectItem>
              <SelectItem value="B2C">B2C</SelectItem>
              <SelectItem value="PME">PME</SelectItem>
              <SelectItem value="Enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleAnalyze} 
          disabled={isLoading}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Analisando...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Analisar Mercado
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
