
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Filter } from "lucide-react";

// Sample transaction data - would come from API in real app
const transactions = [
  {
    id: "tx1",
    description: "AWS Cloud Services",
    amount: -1240,
    date: "Oct 23, 2023",
    category: "Infrastructure",
  },
  {
    id: "tx2",
    description: "Customer Payment - Acme Corp",
    amount: 5000,
    date: "Oct 22, 2023",
    category: "Revenue",
  },
  {
    id: "tx3",
    description: "Office Rent",
    amount: -3500,
    date: "Oct 20, 2023",
    category: "Facilities",
  },
  {
    id: "tx4",
    description: "SaaS Subscriptions",
    amount: -890,
    date: "Oct 19, 2023",
    category: "Software",
  },
  {
    id: "tx5",
    description: "Customer Payment - TechStart Inc",
    amount: 3500,
    date: "Oct 18, 2023",
    category: "Revenue",
  },
];

export const TransactionsCard = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Recent Transactions</CardTitle>
            <CardDescription>Last 30 days of activity</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div 
              key={tx.id}
              className="flex items-center justify-between py-3 border-b border-border last:border-none"
            >
              <div className="flex-1">
                <div className="font-medium text-sm">{tx.description}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>{tx.date}</span>
                  <span className="h-1 w-1 bg-muted-foreground rounded-full"></span>
                  <span>{tx.category}</span>
                </div>
              </div>
              <div className={`text-sm font-medium ${
                tx.amount > 0 ? "text-success" : "text-destructive"
              }`}>
                {tx.amount > 0 ? "+" : ""}
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(tx.amount)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex justify-center">
          <Button variant="ghost" size="sm" className="text-primary">
            <Eye className="h-4 w-4 mr-2" />
            View All Transactions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
