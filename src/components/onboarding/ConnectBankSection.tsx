
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BanknoteIcon, CheckCircle, ChevronRight, Database, LockIcon } from "lucide-react";

interface BankOption {
  id: string;
  name: string;
  logo: string;
  popular: boolean;
}

const mockBanks: BankOption[] = [
  { id: "mercury", name: "Mercury", logo: "M", popular: true },
  { id: "svb", name: "SVB", logo: "S", popular: true },
  { id: "brex", name: "Brex", logo: "B", popular: true },
  { id: "chase", name: "Chase Business", logo: "C", popular: false },
  { id: "wells", name: "Wells Fargo", logo: "W", popular: false },
  { id: "boa", name: "Bank of America", logo: "B", popular: false },
];

export const ConnectBankSection = () => {
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-xl text-center">Connect Your Financial Data</CardTitle>
        <CardDescription className="text-center">
          Link your bank accounts to unlock powerful insights and predictions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
          <LockIcon className="h-4 w-4" />
          <p>We use bank-level security to keep your data safe</p>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium mb-2">Select your business bank:</h3>
          <div className="grid grid-cols-2 gap-3">
            {mockBanks.map((bank) => (
              <div
                key={bank.id}
                className={`border rounded-md p-3 flex items-center gap-3 cursor-pointer transition-colors ${
                  selectedBank === bank.id 
                    ? "border-primary bg-primary/5" 
                    : "hover:border-primary/30"
                }`}
                onClick={() => setSelectedBank(bank.id)}
              >
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {bank.logo}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{bank.name}</div>
                  {bank.popular && (
                    <div className="text-xs text-muted-foreground">Popular</div>
                  )}
                </div>
                {selectedBank === bank.id && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-4 space-y-3">
          <Button className="w-full" disabled={!selectedBank}>
            Connect Bank Account
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
          
          <div className="flex justify-center gap-2 text-sm">
            <BanknoteIcon className="h-4 w-4 text-muted-foreground" />
            <p className="text-muted-foreground">Don't see your bank? <Link to="#" className="text-primary underline underline-offset-2">View all options</Link></p>
          </div>
          
          <div className="text-center pt-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                Skip for now
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
