
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Calendar } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FinanceHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const FinanceHeader: React.FC<FinanceHeaderProps> = ({ 
  selectedDate, 
  onDateChange 
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  
  const months = [
    { value: 0, label: "Janeiro" },
    { value: 1, label: "Fevereiro" },
    { value: 2, label: "Março" },
    { value: 3, label: "Abril" },
    { value: 4, label: "Maio" },
    { value: 5, label: "Junho" },
    { value: 6, label: "Julho" },
    { value: 7, label: "Agosto" },
    { value: 8, label: "Setembro" },
    { value: 9, label: "Outubro" },
    { value: 10, label: "Novembro" },
    { value: 11, label: "Dezembro" }
  ];

  const handleMonthChange = (monthValue: string) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(parseInt(monthValue));
    onDateChange(newDate);
  };

  const handleYearChange = (yearValue: string) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(parseInt(yearValue));
    onDateChange(newDate);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Saúde Financeira</h1>
        <p className="text-muted-foreground">
          Análise da saúde financeira da sua empresa - {format(selectedDate, "MMMM 'de' yyyy", { locale: pt })}
        </p>
      </div>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className={cn(
                "gap-2 min-w-[180px] justify-between bg-white hover:bg-gray-50 border-gray-200 shadow-sm",
                "text-gray-700 font-medium"
              )}
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{format(selectedDate, "MMMM yyyy", { locale: pt })}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-700 mb-3">
                Selecionar período
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Mês
                  </label>
                  <Select 
                    value={selectedDate.getMonth().toString()} 
                    onValueChange={handleMonthChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Ano
                  </label>
                  <Select 
                    value={selectedDate.getFullYear().toString()} 
                    onValueChange={handleYearChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Período selecionado: {format(selectedDate, "MMMM 'de' yyyy", { locale: pt })}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
