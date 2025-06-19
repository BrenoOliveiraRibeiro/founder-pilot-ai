
import React from "react";
import { RunwayAlert } from "@/components/shared/RunwayAlert";

interface CriticalRunwayAlertProps {
  runwayMonths?: number;
}

const CriticalRunwayAlert: React.FC<CriticalRunwayAlertProps> = ({ runwayMonths = 2.5 }) => {
  return <RunwayAlert runwayMonths={runwayMonths} />;
};

export default CriticalRunwayAlert;
