
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export const TestimonialSection = () => {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="container mx-auto max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="overflow-hidden border-0 shadow-lg">
            <CardContent className="p-10 md:p-12 bg-gradient-to-br from-primary/5 to-secondary/20">
              <div className="flex flex-col items-center text-center">
                <svg 
                  className="h-12 w-12 text-primary/30 mb-6" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <blockquote className="text-xl md:text-2xl font-medium mb-6">
                  "Com o FounderPilot AI, entendi onde minha startup estava vazando dinheiro e reestruturei em 2 semanas."
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                    F
                  </div>
                  <div className="ml-4 text-left">
                    <p className="font-semibold">Founder Beta</p>
                    <p className="text-sm text-foreground/70">CEO, Startup XYZ</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};
