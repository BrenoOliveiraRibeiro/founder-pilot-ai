import { useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { usePluggyWidget } from './usePluggyWidget';

interface BankConnection {
  id: string;
  item_id: string;
  institution_name: string;
  status: string;
  last_sync: string | null;
}

export const useBankUpdateWidget = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateStatus, setUpdateStatus] = useState("");
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentEmpresa } = useAuth();
  const { isScriptLoaded, initializePluggyConnect } = usePluggyWidget();
  const updateContainerRef = useRef<HTMLDivElement>(null);

  // Fetch existing connections
  const fetchConnections = async () => {
    if (!currentEmpresa?.id) return;

    try {
      const { data, error } = await supabase
        .from('integracoes_bancarias')
        .select('id, item_id, nome_banco, status, ultimo_sincronismo')
        .eq('empresa_id', currentEmpresa.id)
        .eq('tipo_conexao', 'Open Finance');

      if (error) throw error;

      // Map the data to match our interface
      const mappedConnections = (data || []).map(item => ({
        id: item.id,
        item_id: item.item_id,
        institution_name: item.nome_banco,
        status: item.status,
        last_sync: item.ultimo_sincronismo
      }));

      setConnections(mappedConnections);
      if (mappedConnections.length > 0 && !selectedConnection) {
        setSelectedConnection(mappedConnections[0].id);
      }
    } catch (error: any) {
      console.error('Erro ao buscar conexões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conexões existentes.",
        variant: "destructive",
      });
    }
  };

  // Update existing bank connection
  const handleUpdateConnection = async () => {
    if (!selectedConnection || !currentEmpresa?.id) {
      toast({
        title: "Erro",
        description: "Selecione uma conexão para atualizar.",
        variant: "destructive"
      });
      return;
    }

    const connection = connections.find(c => c.id === selectedConnection);
    if (!connection) {
      toast({
        title: "Erro",
        description: "Conexão não encontrada.",
        variant: "destructive"
      });
      return;
    }

    if (!isScriptLoaded) {
      toast({
        title: "Erro",
        description: "Widget ainda não foi carregado. Aguarde um momento.",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    setUpdateProgress(20);
    setUpdateStatus("Inicializando atualização...");

    try {
      console.log("Iniciando atualização para item:", connection.item_id);
      
      setUpdateProgress(40);
      setUpdateStatus("Aguardando autenticação...");

      // Initialize Pluggy Connect for update using the corrected hook
      await initializePluggyConnect(
        async (itemData: { item: { id: string } }) => {
          console.log("Item atualizado com sucesso:", itemData.item.id);
          setUpdateProgress(80);
          setUpdateStatus("Sincronizando dados atualizados...");
          await handleUpdateSuccess(connection.id, itemData.item.id);
        },
        (error: any) => {
          console.error("Erro no widget do Pluggy:", error);
          setUpdateProgress(0);
          toast({
            title: "Erro de atualização",
            description: "Não foi possível atualizar a conexão. " + (error.message || "Erro desconhecido"),
            variant: "destructive"
          });
          setIsUpdating(false);
        },
        connection.item_id, // Pass item_id for update
        true // Enable update mode
      );

      console.log("Pluggy Connect inicializado para atualização");

    } catch (error: any) {
      console.error("Erro ao atualizar conexão:", error);
      setUpdateProgress(0);
      toast({
        title: "Erro ao atualizar conexão",
        description: error.message || "Não foi possível atualizar a conexão. Tente novamente.",
        variant: "destructive"
      });
      setIsUpdating(false);
    }
  };

  const handleUpdateSuccess = async (connectionId: string, itemId: string) => {
    try {
      setUpdateProgress(90);
      setUpdateStatus("Finalizando atualização...");

      console.log("Registrando atualização no backend:", itemId);

      // Update the connection record
      const { error } = await supabase
        .from('integracoes_bancarias')
        .update({
          ultimo_sincronismo: new Date().toISOString(),
          status: 'connected'
        })
        .eq('id', connectionId);

      if (error) {
        console.error("Erro ao atualizar registro:", error);
        throw error;
      }

      setUpdateProgress(100);
      setUpdateStatus("Atualização concluída!");

      toast({
        title: "Conexão atualizada com sucesso!",
        description: "Sua conta bancária foi atualizada e os dados estão sendo sincronizados.",
      });

      // Refresh connections list
      await fetchConnections();

    } catch (error: any) {
      console.error("Erro ao registrar atualização:", error);
      toast({
        title: "Erro ao registrar atualização",
        description: error.message || "A atualização foi feita, mas houve um erro ao registrar.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
      setTimeout(() => {
        setUpdateProgress(0);
        setUpdateStatus("");
      }, 2000);
    }
  };

  return {
    isUpdating,
    updateProgress,
    updateStatus,
    connections,
    selectedConnection,
    setSelectedConnection,
    updateContainerRef,
    isScriptLoaded,
    handleUpdateConnection,
    fetchConnections
  };
};