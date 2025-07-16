import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Download, Calendar } from 'lucide-react';
import { useTransactionExport } from '@/hooks/useTransactionExport';
import { addDays, subDays } from 'date-fns';

interface ExportDialogProps {
  trigger?: React.ReactNode;
  className?: string;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ trigger, className }) => {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30)); // Last 30 days
  const [endDate, setEndDate] = useState<Date>(new Date());
  const { exportTransactions, isExporting } = useTransactionExport();

  const handleExport = async () => {
    if (!startDate || !endDate) {
      return;
    }

    if (startDate > endDate) {
      return;
    }

    await exportTransactions(startDate, endDate);
    setOpen(false);
  };

  const setPresetRange = (days: number) => {
    const end = new Date();
    const start = subDays(end, days);
    setStartDate(start);
    setEndDate(end);
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className={className}>
      <Download className="h-4 w-4 mr-2" />
      Exportar
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Transações</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Período de Exportação</label>
            
            {/* Quick preset buttons */}
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPresetRange(7)}
                className="text-xs"
              >
                7 dias
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPresetRange(30)}
                className="text-xs"
              >
                30 dias
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPresetRange(90)}
                className="text-xs"
              >
                90 dias
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Data Inicial</label>
                <DatePicker
                  date={startDate}
                  onDateChange={setStartDate}
                  placeholder="Selecione a data inicial"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Data Final</label>
                <DatePicker
                  date={endDate}
                  onDateChange={setEndDate}
                  placeholder="Selecione a data final"
                />
              </div>
            </div>
          </div>

          {startDate && endDate && startDate > endDate && (
            <p className="text-sm text-destructive">
              A data inicial deve ser anterior à data final
            </p>
          )}

          <div className="bg-muted/50 p-3 rounded-lg text-sm">
            <p className="font-medium mb-1">Dados incluídos na exportação:</p>
            <ul className="text-muted-foreground space-y-1">
              <li>• Todas as transações bancárias do período</li>
              <li>• Data, descrição, valor e categoria</li>
              <li>• Método de pagamento e banco de origem</li>
              <li>• Formato CSV compatível com Excel</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isExporting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleExport}
              disabled={!startDate || !endDate || startDate > endDate || isExporting}
              className="gap-2"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};