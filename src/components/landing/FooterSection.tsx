
import React from "react";
import { FounderPilotLogo } from "@/components/shared/FounderPilotLogo";

export const FooterSection = () => {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/40">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-center mb-8">
          <blockquote className="italic text-center text-primary/80 text-lg font-medium border-l-4 border-primary/30 pl-4 py-1">
            "A clareza é o poder dos que decidem."
            <span className="text-foreground/80 not-italic"> – Sêneca</span>
          </blockquote>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-6 md:mb-0">
            <div className="mr-2">
              <FounderPilotLogo className="h-6 w-6 text-primary" />
            </div>
            <span className="text-foreground/70 text-sm">
              © {new Date().getFullYear()} Synapsia
              <span className="inline-block mx-1 transform translate-y-[-2px]">∞</span> 
              Todos os direitos reservados.
            </span>
          </div>
          
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">
              Sobre a Synapsia
            </a>
            <a href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">
              Privacidade
            </a>
            <a href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">
              Termos
            </a>
            <a href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">
              Contato
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
