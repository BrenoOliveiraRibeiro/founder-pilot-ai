
import React from "react";
import { motion } from "framer-motion";
import { InsightItem } from "./InsightItem";
import { InsightsSkeleton } from "./InsightsSkeleton";
import { getIconFromType, getStatusFromPriority, getExampleInsights } from "./InsightMapper";
import { Insight } from "@/integrations/supabase/models";

interface InsightsContentProps {
  loading: boolean;
  insights: Insight[];
}

export const InsightsContent = ({ loading, insights }: InsightsContentProps) => {
  const insightsToDisplay = insights.length > 0 ? insights : getExampleInsights();

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  if (loading) {
    return <InsightsSkeleton />;
  }

  return (
    <motion.div
      variants={contentVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {insightsToDisplay.map((insight, index) => (
        <InsightItem
          key={insight.id}
          index={index}
          icon={getIconFromType(insight.tipo)}
          title={insight.titulo}
          status={getStatusFromPriority(insight.prioridade)}
        />
      ))}
    </motion.div>
  );
};
