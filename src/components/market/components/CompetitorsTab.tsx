
import React from "react";
import { formatCurrency } from "../utils/formatters";

interface CompetitorsTabProps {
  competitorsData: any[];
  tamSamSomData: any[];
  customerType: string;
}

export const CompetitorsTab: React.FC<CompetitorsTabProps> = ({
  competitorsData,
  tamSamSomData,
  customerType
}) => {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="font-medium text-lg mb-3">Principais Players no Mercado</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {competitorsData.map((competitor, index) => (
            <div 
              key={index} 
              className="p-4 rounded-lg border bg-card"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">
                  {competitor.name}
                </h4>
                <span className="text-sm bg-muted px-2 py-0.5 rounded-full">
                  {competitor.target}
                </span>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Market share:</span>
                    <span className="font-medium">{competitor.market_share}%</span>
                  </div>
                  <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${competitor.market_share}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-muted-foreground">Valuation estimado:</span>
                  <span className="text-sm font-semibold">{competitor.valuation}</span>
                </div>
              </div>
            </div>
          ))}
          
          <div className="p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium text-primary">
                Sua Empresa (Potencial)
              </h4>
              <span className="text-sm bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                {customerType || "B2B"}
              </span>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Market share alvo:</span>
                  <span className="font-medium">5-10%</span>
                </div>
                <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{ width: `7%` }}
                  />
                </div>
              </div>
              
              <div className="flex justify-between mt-2">
                <span className="text-sm text-muted-foreground">SOM em 3-5 anos:</span>
                <span className="text-sm font-semibold">{formatCurrency(tamSamSomData[2]?.value || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-muted/50 rounded-lg p-4 border">
          <h3 className="font-medium mb-2">Estratégias comuns no setor</h3>
          <ul className="space-y-2">
            <li className="text-sm flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Diferenciação por meio de tecnologia proprietária e inovação constante</span>
            </li>
            <li className="text-sm flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Foco em nichos específicos para maximizar penetração e minimizar CAC</span>
            </li>
            <li className="text-sm flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Parcerias estratégicas para expansão do alcance e redução de custos</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-4 border">
          <h3 className="font-medium mb-2">Métricas-chave observadas</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 text-sm">
              <span className="text-muted-foreground">CAC médio:</span>
              <span className="font-medium">R$750-1.500</span>
            </div>
            <div className="grid grid-cols-2 text-sm">
              <span className="text-muted-foreground">LTV médio:</span>
              <span className="font-medium">R$4.500-9.000</span>
            </div>
            <div className="grid grid-cols-2 text-sm">
              <span className="text-muted-foreground">Razão LTV:CAC:</span>
              <span className="font-medium">6:1</span>
            </div>
            <div className="grid grid-cols-2 text-sm">
              <span className="text-muted-foreground">Churn anual:</span>
              <span className="font-medium">15-25%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
