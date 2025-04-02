
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIAdvisorEngine } from "./AIAdvisorEngine";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export const AIAdvisorCard = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Co-Founder IA</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link to="/advisor">
            Acessar IA <ExternalLink className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <AIAdvisorEngine />
      </CardContent>
    </Card>
  );
};
