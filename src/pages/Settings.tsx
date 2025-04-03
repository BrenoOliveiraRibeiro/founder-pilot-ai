
import React from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileSettingsTab } from "@/components/settings/ProfileSettingsTab";
import { NotificationSettingsTab } from "@/components/settings/NotificationSettingsTab";
import { ApiIntegrationSettingsTab } from "@/components/settings/ApiIntegrationSettingsTab";
import { DisplaySettingsTab } from "@/components/settings/DisplaySettingsTab";

const Settings = () => {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas preferências e configurações de conta
          </p>
        </div>

        <Card className="border-none shadow-md dark:border dark:border-border/40">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle>Configurações da conta</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
                <TabsTrigger
                  value="profile"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-4"
                >
                  Perfil
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-4"
                >
                  Notificações
                </TabsTrigger>
                <TabsTrigger
                  value="integrations"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-4"
                >
                  Integrações API
                </TabsTrigger>
                <TabsTrigger
                  value="display"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-4"
                >
                  Aparência
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="p-6">
                <ProfileSettingsTab />
              </TabsContent>
              
              <TabsContent value="notifications" className="p-6">
                <NotificationSettingsTab />
              </TabsContent>
              
              <TabsContent value="integrations" className="p-6">
                <ApiIntegrationSettingsTab />
              </TabsContent>
              
              <TabsContent value="display" className="p-6">
                <DisplaySettingsTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Settings;
