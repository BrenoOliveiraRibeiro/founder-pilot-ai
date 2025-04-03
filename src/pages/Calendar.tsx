
import React, { useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarClock, PlusCircle } from "lucide-react";

const CalendarPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState([
    { id: 1, title: "Reunião com investidores", date: new Date(2025, 3, 5, 10, 0), duration: 60 },
    { id: 2, title: "Revisão do pitch deck", date: new Date(2025, 3, 7, 14, 0), duration: 90 },
    { id: 3, title: "Call com mentor", date: new Date(2025, 3, 10, 16, 0), duration: 45 }
  ]);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendário</h1>
          <p className="text-muted-foreground">
            Gerencie seus compromissos e integre com o Google Agenda
          </p>
        </div>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Novo evento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Selecione uma data</CardTitle>
            <CardDescription>Visualize e edite seus eventos</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="pointer-events-auto rounded-md border"
            />
            <div className="mt-4">
              <Button variant="outline" className="w-full gap-2">
                <CalendarClock className="h-4 w-4" />
                Conectar Google Agenda
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              {date ? date.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "Eventos"}
            </CardTitle>
            <CardDescription>
              {events.length} eventos agendados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map(event => (
                <div 
                  key={event.id} 
                  className="p-4 rounded-lg border bg-card text-card-foreground"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {event.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} 
                        - {event.duration} minutos
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">Editar</Button>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum evento para esta data
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default CalendarPage;
