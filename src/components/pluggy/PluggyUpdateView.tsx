import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, RefreshCw, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PluggyItem {
  id: string;
  nome_banco: string;
  status: string;
  ultimo_sincronismo: string;
  item_id: string;
}

interface PluggyUpdateViewProps {
  isConnecting: boolean;
  isScriptLoaded: boolean;
  onUpdateConnection: (itemId: string) => void;
}

export const PluggyUpdateView = ({ 
  isConnecting, 
  isScriptLoaded, 
  onUpdateConnection 
}: PluggyUpdateViewProps) => {
  const [items, setItems] = useState<PluggyItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadExistingItems();
  }, [currentEmpresa?.id]);

  useEffect(() => {
    // Reset updating state when connection process finishes
    if (!isConnecting) {
      setIsUpdating(false);
    }
  }, [isConnecting]);

  const loadExistingItems = async () => {
    if (!currentEmpresa?.id) return;

    try {
      setIsLoading(true);
      console.log('Carregando itens Pluggy existentes para empresa:', currentEmpresa.id);
      
      const { data: integracoes, error } = await supabase
        .from('integracoes_bancarias')
        .select('id, nome_banco, status, ultimo_sincronismo, item_id')
        .eq('empresa_id', currentEmpresa.id)
        .eq('tipo_conexao', 'Open Finance')
        .not('item_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Erro ao carregar itens: ${error.message}`);
      }

      setItems(integracoes || []);
      console.log(`${integracoes?.length || 0} itens encontrados`);
    } catch (error: any) {
      console.error('Erro ao carregar itens:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível carregar os itens existentes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateClick = () => {
    if (!selectedItemId) {
      toast({
        title: "Item não selecionado",
        description: "Selecione um item para atualizar a conexão.",
        variant: "destructive",
      });
      return;
    }

    const selectedItem = items.find(item => item.item_id === selectedItemId);
    console.log(`Iniciando atualização para item: ${selectedItemId} (${selectedItem?.nome_banco})`);
    
    setIsUpdating(true);
    toast({
      title: "Iniciando atualização",
      description: `Preparando atualização da conexão com ${selectedItem?.nome_banco}...`,
      variant: "default",
    });

    onUpdateConnection(selectedItemId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'erro':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/open-finance" className="inline-flex items-center text-primary hover:text-primary/80">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Open Finance
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Atualizar Conexão Bancária
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Selecione um item existente para reautenticar ou atualizar a conexão bancária
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Carregando itens...</span>
            </div>
          ) : items.length === 0 ? (
            <Card className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Nenhum item encontrado
              </h2>
              <p className="text-muted-foreground mb-4">
                Você precisa ter pelo menos uma conexão bancária ativa para poder atualizá-la.
              </p>
              <Link to="/pluggy-integration">
                <Button>Criar primeira conexão</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Itens disponíveis para atualização
                </h2>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <p className="font-medium text-foreground">{item.nome_banco}</p>
                          <p className="text-sm text-muted-foreground">
                            Item ID: {item.item_id}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Último sync: {formatDate(item.ultimo_sincronismo)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.status === 'ativo' 
                            ? 'bg-success/10 text-success' 
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {item.status === 'ativo' ? 'Ativo' : 'Com erro'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Selecione o item para atualizar
                    </label>
                    <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Escolha um item para atualizar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((item) => (
                          <SelectItem key={item.item_id} value={item.item_id}>
                            {item.nome_banco} - {item.item_id}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleUpdateClick}
                    className="w-full" 
                    disabled={isConnecting || isUpdating || !isScriptLoaded || !selectedItemId}
                  >
                    {isConnecting || isUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isUpdating ? 'Preparando atualização...' : 'Atualizando conexão...'}
                      </>
                    ) : !isScriptLoaded ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Carregando widget...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Atualizar Conexão Selecionada
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground mb-1">
                      Sobre a atualização de conexões
                    </p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• A atualização é necessária quando há problemas de autenticação</li>
                      <li>• Pode ser solicitado MFA (autenticação de dois fatores)</li>
                      <li>• Os dados existentes serão mantidos e atualizados</li>
                      <li>• O processo é seguro e criptografado pelo OpenFinance</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};