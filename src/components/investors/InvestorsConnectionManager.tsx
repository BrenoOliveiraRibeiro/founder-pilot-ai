
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Users, UserPlus, Trash2, Mail } from "lucide-react";

type InvestorType = {
  id: string;
  name: string;
  email: string;
  company: string;
  permissions: string[];
};

export function InvestorsConnectionManager() {
  const { toast } = useToast();
  const [investors, setInvestors] = useState<InvestorType[]>([
    {
      id: "1",
      name: "Ricardo Silva",
      email: "ricardo@vcfund.com",
      company: "VC Fund Brasil",
      permissions: ["financials", "metrics", "runway"],
    },
    {
      id: "2",
      name: "Ana Mendes",
      email: "ana@angelinvest.com",
      company: "Angel Investments",
      permissions: ["metrics", "runway"],
    },
  ]);
  
  const [newInvestor, setNewInvestor] = useState({
    name: "",
    email: "",
    company: "",
  });
  
  const [selectedPermissions, setSelectedPermissions] = useState({
    financials: true,
    metrics: true,
    runway: true,
    transactions: false,
    team: false,
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddInvestor = () => {
    if (!newInvestor.name || !newInvestor.email) {
      toast({
        title: "Informações incompletas",
        description: "Por favor, preencha o nome e e-mail do investidor.",
        variant: "destructive",
      });
      return;
    }
    
    const permissions = Object.entries(selectedPermissions)
      .filter(([_, isSelected]) => isSelected)
      .map(([key]) => key);
    
    const newId = (investors.length + 1).toString();
    
    setInvestors([
      ...investors,
      {
        id: newId,
        name: newInvestor.name,
        email: newInvestor.email,
        company: newInvestor.company,
        permissions,
      },
    ]);
    
    setNewInvestor({
      name: "",
      email: "",
      company: "",
    });
    
    setDialogOpen(false);
    
    toast({
      title: "Investidor adicionado",
      description: `${newInvestor.name} agora tem acesso ao seu dashboard.`,
    });
  };

  const handleRemoveInvestor = (id: string) => {
    setInvestors(investors.filter(investor => investor.id !== id));
    toast({
      title: "Investidor removido",
      description: "O investidor não tem mais acesso ao seu dashboard.",
    });
  };

  const handleResendInvite = (email: string) => {
    toast({
      title: "Convite reenviado",
      description: `Um novo convite foi enviado para ${email}.`,
    });
  };

  const getPermissionLabel = (permission: string): string => {
    const labels: Record<string, string> = {
      financials: "Dados Financeiros",
      metrics: "Métricas de Crescimento",
      runway: "Análise de Runway",
      transactions: "Transações",
      team: "Equipe e Organização",
    };
    
    return labels[permission] || permission;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Users className="h-5 w-5" />
            Connect your Investors
          </h3>
          <p className="text-sm text-muted-foreground">
            Gerencie quais investidores podem acessar seus dados e quais informações compartilhar.
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Investidor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar novo investidor</DialogTitle>
              <DialogDescription>
                Convide um investidor para acessar seu dashboard com permissões específicas.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do investidor</Label>
                <Input 
                  id="name" 
                  placeholder="Nome completo" 
                  value={newInvestor.name}
                  onChange={(e) => setNewInvestor({...newInvestor, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="email@exemplo.com"
                  value={newInvestor.email}
                  onChange={(e) => setNewInvestor({...newInvestor, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Empresa/Fundo (opcional)</Label>
                <Input 
                  id="company" 
                  placeholder="Nome da empresa ou fundo"
                  value={newInvestor.company}
                  onChange={(e) => setNewInvestor({...newInvestor, company: e.target.value})}
                />
              </div>
              
              <div className="space-y-3 pt-2">
                <Label>Informações que serão compartilhadas</Label>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="financials" 
                      checked={selectedPermissions.financials}
                      onCheckedChange={(checked) => 
                        setSelectedPermissions({...selectedPermissions, financials: !!checked})
                      }
                    />
                    <label
                      htmlFor="financials"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Dados Financeiros
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="metrics" 
                      checked={selectedPermissions.metrics}
                      onCheckedChange={(checked) => 
                        setSelectedPermissions({...selectedPermissions, metrics: !!checked})
                      }
                    />
                    <label
                      htmlFor="metrics"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Métricas de Crescimento
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="runway" 
                      checked={selectedPermissions.runway}
                      onCheckedChange={(checked) => 
                        setSelectedPermissions({...selectedPermissions, runway: !!checked})
                      }
                    />
                    <label
                      htmlFor="runway"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Análise de Runway
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="transactions" 
                      checked={selectedPermissions.transactions}
                      onCheckedChange={(checked) => 
                        setSelectedPermissions({...selectedPermissions, transactions: !!checked})
                      }
                    />
                    <label
                      htmlFor="transactions"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Transações
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="team" 
                      checked={selectedPermissions.team}
                      onCheckedChange={(checked) => 
                        setSelectedPermissions({...selectedPermissions, team: !!checked})
                      }
                    />
                    <label
                      htmlFor="team"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Equipe e Organização
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddInvestor}>
                Convidar Investidor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {investors.length > 0 ? (
        <div className="space-y-4">
          {investors.map((investor) => (
            <Card key={investor.id} className="border-border/60">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base font-medium">{investor.name}</CardTitle>
                    <CardDescription>
                      {investor.company && `${investor.company} • `}{investor.email}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleResendInvite(investor.email)}
                      title="Reenviar convite"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      onClick={() => handleRemoveInvestor(investor.id)}
                      title="Remover acesso"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {investor.permissions.map((permission) => (
                    <Badge key={permission} variant="outline" className="bg-primary/5">
                      {getPermissionLabel(permission)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-border/60">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-base font-medium text-center mb-1">
              Nenhum investidor conectado
            </CardTitle>
            <CardDescription className="text-center max-w-sm mx-auto mb-4">
              Convide seus investidores para terem acesso a um dashboard personalizado com os dados que você escolher compartilhar.
            </CardDescription>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Investidor
                </Button>
              </DialogTrigger>
              <DialogContent>
                {/* Dialog content for adding investor */}
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
