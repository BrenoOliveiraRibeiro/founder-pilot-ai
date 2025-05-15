
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Seu copiloto financeiro com inteligência artificial
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Obtenha insights estratégicos para tomar melhores decisões para sua startup com dados financeiros inteligentes.
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
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Dashboard Inteligente</h3>
                      <div className="bg-muted p-4 rounded-md flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Análises Financeiras</p>
                          <p className="text-xs text-muted-foreground">Visualize indicadores em tempo real</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-xs">
                          Explorar
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="h-14 w-24 bg-muted rounded-md flex items-center justify-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 mr-2"></div>
                        <div className="space-y-1">
                          <div className="h-2 bg-primary/20 rounded w-12"></div>
                          <div className="h-2 bg-muted-foreground/30 rounded w-10"></div>
                        </div>
                      </div>
                      <div className="h-14 w-24 bg-muted rounded-md flex items-center justify-center">
                        <div className="h-8 w-8 rounded-full bg-green-500/10 mr-2"></div>
                        <div className="space-y-1">
                          <div className="h-2 bg-green-500/20 rounded w-12"></div>
                          <div className="h-2 bg-muted-foreground/30 rounded w-10"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-5/6"></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="bg-muted p-3 rounded-md">
                        <div className="h-10 w-10 bg-primary/10 rounded-full mb-2"></div>
                        <div className="h-2 bg-primary/20 rounded w-1/2 mb-1"></div>
                        <div className="h-2 bg-muted-foreground/30 rounded w-3/4"></div>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <div className="h-10 w-10 bg-primary/10 rounded-full mb-2"></div>
                        <div className="h-2 bg-primary/20 rounded w-2/3 mb-1"></div>
                        <div className="h-2 bg-muted-foreground/30 rounded w-4/5"></div>
                      </div>
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
