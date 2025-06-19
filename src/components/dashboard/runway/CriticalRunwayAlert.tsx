
import React from "react";
import { RunwayAlert } from "@/components/shared/RunwayAlert";

interface CriticalRunwayAlertProps {
  runwayMonths?: number;
  hasRealData?: boolean;
}

const CriticalRunwayAlert: React.FC<CriticalRunwayAlertProps> = ({ 
  runwayMonths = 2.5, 
  hasRealData = true 
}) => {
  return <RunwayAlert runwayMonths={runwayMonths} hasRealData={hasRealData} />;
};

export default CriticalRunwayAlert;
