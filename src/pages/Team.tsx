
import React from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users } from "lucide-react";

const teamMembers = [
  { id: 1, name: "Ana Silva", role: "CEO & Co-fundadora", email: "ana@startup.com", avatar: "" },
  { id: 2, name: "Carlos Mendes", role: "CTO & Co-fundador", email: "carlos@startup.com", avatar: "" },
  { id: 3, name: "Mariana Costa", role: "CMO", email: "mariana@startup.com", avatar: "" },
  { id: 4, name: "Bruno Alves", role: "Desenvolvedor", email: "bruno@startup.com", avatar: "" },
];

const TeamPage = () => {
  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipe</h1>
          <p className="text-muted-foreground">
            Gerencie sua equipe e acompanhe despesas com colaboradores
          </p>
        </div>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Adicionar membro
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {teamMembers.map((member) => (
          <Card key={member.id} className="overflow-hidden">
            <CardHeader className="pb-0">
              <div className="flex justify-center mb-2">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-xl">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-center">{member.name}</CardTitle>
              <CardDescription className="text-center">{member.role}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 text-center">
              <p className="text-sm text-muted-foreground mb-4">{member.email}</p>
              <Button variant="outline" size="sm">Ver perfil</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Visão geral da equipe</CardTitle>
          </div>
          <CardDescription>Informações sobre a composição e custos da equipe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg border bg-accent/50">
              <p className="text-sm font-medium mb-1">Total de membros</p>
              <p className="text-2xl font-bold">{teamMembers.length}</p>
            </div>
            <div className="p-4 rounded-lg border bg-accent/50">
              <p className="text-sm font-medium mb-1">Custo mensal</p>
              <p className="text-2xl font-bold">R$ 42.500</p>
            </div>
            <div className="p-4 rounded-lg border bg-accent/50">
              <p className="text-sm font-medium mb-1">Média por membro</p>
              <p className="text-2xl font-bold">R$ {(42500 / teamMembers.length).toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
};

export default TeamPage;
