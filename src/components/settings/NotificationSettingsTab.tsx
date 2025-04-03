
import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function NotificationSettingsTab() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Preferências de notificação salvas",
      description: "Suas configurações de notificação foram atualizadas.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Notificações</h3>
        <p className="text-sm text-muted-foreground">
          Configure como e quando você deseja receber notificações.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Notificações por email</h4>
          
          <div className="flex items-center justify-between py-3 border-b border-border/60">
            <div className="space-y-0.5">
              <Label htmlFor="email-alerts">Alertas de análise financeira</Label>
              <p className="text-sm text-muted-foreground">
                Receber alertas quando houver mudanças significativas em métricas financeiras.
              </p>
            </div>
            <Switch id="email-alerts" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-border/60">
            <div className="space-y-0.5">
              <Label htmlFor="email-runway">Alertas de runway</Label>
              <p className="text-sm text-muted-foreground">
                Receber alertas quando seu runway estiver abaixo de 3 meses.
              </p>
            </div>
            <Switch id="email-runway" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-border/60">
            <div className="space-y-0.5">
              <Label htmlFor="email-reports">Relatórios semanais</Label>
              <p className="text-sm text-muted-foreground">
                Receber resumos semanais do desempenho da sua empresa.
              </p>
            </div>
            <Switch id="email-reports" />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Notificações do aplicativo</h4>
          
          <div className="flex items-center justify-between py-3 border-b border-border/60">
            <div className="space-y-0.5">
              <Label htmlFor="app-insights">Insights da IA</Label>
              <p className="text-sm text-muted-foreground">
                Receber notificações quando o Co-Founder IA gerar novos insights.
              </p>
            </div>
            <Switch id="app-insights" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-border/60">
            <div className="space-y-0.5">
              <Label htmlFor="app-transactions">Novas transações</Label>
              <p className="text-sm text-muted-foreground">
                Receber notificações sobre novas transações bancárias.
              </p>
            </div>
            <Switch id="app-transactions" />
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-border/60">
            <div className="space-y-0.5">
              <Label htmlFor="app-team">Atividades da equipe</Label>
              <p className="text-sm text-muted-foreground">
                Receber notificações sobre atividades de membros da equipe.
              </p>
            </div>
            <Switch id="app-team" />
          </div>
        </div>

        <Button type="submit">Salvar preferências</Button>
      </form>
    </div>
  );
}
