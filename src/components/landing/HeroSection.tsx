
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ChartBar, ChartPie, ChartLine, AlertTriangle } from "lucide-react";
import { FounderPilotLogo } from "../shared/FounderPilotLogo";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight">
              Seu copiloto financeiro e estratégico com inteligência artificial
            </h1>
            <p className="text-xl md:text-2xl text-primary/80 font-medium mb-2">
              Decidir no escuro custa caro.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              Transforme dados financeiros, operacionais e de mercado em insights acionáveis. Tome decisões com clareza, velocidade e segurança.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="px-8 py-6 text-base font-medium flex items-center"
              >
                Comece agora 
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-6 text-base border-primary/30 text-primary hover:bg-primary/5"
              >
                Saiba mais
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-bold text-primary`}>
                    {i}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Acompanhe o desempenho da sua empresa com <span className="text-primary font-medium">análises inteligentes</span>
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full md:w-1/2 lg:w-2/5"
          >
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-1">
              <div className="bg-card/80 backdrop-blur-sm rounded-xl overflow-hidden border border-border/50 shadow-lg">
                <div className="bg-primary/5 p-3 flex items-center justify-between border-b border-border/30">
                  <h3 className="text-sm font-medium">Dashboard Financeiro</h3>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-base font-semibold">Visão Financeira</h3>
                        <p className="text-xs text-muted-foreground">Maio 2025</p>
                      </div>
                      <div className="bg-primary/10 px-2 py-1 rounded text-xs font-medium text-primary">
                        Saudável
                      </div>
                    </div>
                    
                    {/* Insight AI Alert */}
                    <div className="bg-red-50/60 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 p-3 rounded-lg mb-4 animate-pulse-subtle">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-semibold text-red-600 dark:text-red-400">Alerta Crítico de Runway</span>
                      </div>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Seu caixa acaba em 68 dias. Sugestão: Reduzir R$ 2.100/mês em ferramentas pouco utilizadas.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <ChartLine className="w-4 h-4 text-primary mr-1" />
                          <span className="text-xs font-medium">Receita</span>
                        </div>
                        <p className="text-base font-bold">R$ 125.400</p>
                        <div className="text-xs text-green-500 flex items-center mt-1">
                          <span>+14%</span>
                          <div className="w-10 h-3 ml-1 overflow-hidden flex items-end">
                            {[3, 5, 4, 7, 6, 8].map((h, i) => (
                              <div 
                                key={i}
                                className="w-1 mx-px bg-green-500/60" 
                                style={{ height: `${h}px` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="flex items-center mb-1">
                          <ChartBar className="w-4 h-4 text-primary mr-1" />
                          <span className="text-xs font-medium">Despesas</span>
                        </div>
                        <p className="text-base font-bold">R$ 84.200</p>
                        <div className="text-xs text-amber-500 flex items-center mt-1">
                          <span>+5%</span>
                          <div className="w-10 h-3 ml-1 overflow-hidden flex items-end">
                            {[5, 6, 4, 7, 5, 8].map((h, i) => (
                              <div 
                                key={i}
                                className="w-1 mx-px bg-amber-500/60" 
                                style={{ height: `${h}px` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <ChartPie className="w-4 h-4 text-primary mr-1" />
                          <span className="text-xs font-medium">Runway</span>
                        </div>
                        <span className="text-xs font-medium">14.5 meses</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mb-1">
                        <div className="bg-gradient-to-r from-primary to-green-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Atual</span>
                        <span>Meta: 18 meses</span>
                      </div>
                    </div>
                    
                    <div className="pt-2 flex justify-end">
                      <Button variant="ghost" size="sm" className="text-xs flex items-center">
                        Ver mais detalhes
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
