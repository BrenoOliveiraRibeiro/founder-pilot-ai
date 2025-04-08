
import * as React from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({ date, onDateChange, placeholder = "Selecione uma data", className }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal border-0 bg-transparent hover:bg-transparent",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="h-5 w-5 text-muted-foreground mr-2" />
          {date ? (
            <span className="flex-1">
              {format(date, "dd 'de' MMMM 'de' yyyy", { locale: pt })}
            </span>
          ) : (
            <span className="flex-1">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
          className="pointer-events-auto rounded-md border"
          locale={pt}
          showOutsideDays
          fixedWeeks
        />
      </PopoverContent>
    </Popover>
  );
}
