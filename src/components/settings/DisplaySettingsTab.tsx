
import React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { Moon, Sun } from "lucide-react";

export function DisplaySettingsTab() {
  const { toast } = useToast();
  const [theme, setTheme] = React.useState("system");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Configurações de aparência salvas",
      description: "Suas preferências visuais foram atualizadas.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Aparência</h3>
        <p className="text-sm text-muted-foreground">
          Personalize a aparência e o tema da plataforma.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="theme">Tema</Label>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
                  theme === "light" ? "border-primary" : ""
                }`}
                onClick={() => setTheme("light")}
              >
                <Sun className="h-5 w-5 mb-3" />
                <div className="space-y-1 text-center">
                  <h4 className="font-medium leading-none">Claro</h4>
                </div>
              </div>
              <div
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
                  theme === "dark" ? "border-primary" : ""
                }`}
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-5 w-5 mb-3" />
                <div className="space-y-1 text-center">
                  <h4 className="font-medium leading-none">Escuro</h4>
                </div>
              </div>
              <div
                className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground ${
                  theme === "system" ? "border-primary" : ""
                }`}
                onClick={() => setTheme("system")}
              >
                <div className="flex gap-1 mb-3">
                  <Sun className="h-5 w-5" />
                  <Moon className="h-5 w-5" />
                </div>
                <div className="space-y-1 text-center">
                  <h4 className="font-medium leading-none">Sistema</h4>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between py-3 border-b border-border/60">
              <div className="space-y-0.5">
                <Label htmlFor="animations">Animações</Label>
                <p className="text-sm text-muted-foreground">
                  Ativar animações e transições na interface.
                </p>
              </div>
              <Switch id="animations" defaultChecked />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border/60">
              <div className="space-y-0.5">
                <Label htmlFor="compact-mode">Modo compacto</Label>
                <p className="text-sm text-muted-foreground">
                  Reduz o espaçamento e tamanho dos elementos.
                </p>
              </div>
              <Switch id="compact-mode" />
            </div>
          </div>

          <div className="grid gap-2 pt-4">
            <Label htmlFor="layout-density">Densidade do layout</Label>
            <RadioGroup defaultValue="default" className="grid grid-cols-3 gap-4 pt-2">
              <div>
                <RadioGroupItem
                  value="comfortable"
                  id="comfortable"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="comfortable"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary"
                >
                  <div className="space-y-1 text-center">
                    <h4 className="font-medium leading-none">Confortável</h4>
                  </div>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="default"
                  id="default"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="default"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary"
                >
                  <div className="space-y-1 text-center">
                    <h4 className="font-medium leading-none">Padrão</h4>
                  </div>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="compact"
                  id="compact"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="compact"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary"
                >
                  <div className="space-y-1 text-center">
                    <h4 className="font-medium leading-none">Compacto</h4>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-2 pt-4">
            <Label htmlFor="font-size">Tamanho da fonte</Label>
            <Select defaultValue="default">
              <SelectTrigger id="font-size">
                <SelectValue placeholder="Selecione o tamanho da fonte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Pequeno</SelectItem>
                <SelectItem value="default">Padrão</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit">Salvar preferências</Button>
      </form>
    </div>
  );
}
