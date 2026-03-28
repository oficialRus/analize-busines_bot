import { Braces } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface DebugCardProps {
  json: string | null;
  /** Пока ждём mock-ответ после submit */
  pending?: boolean;
  className?: string;
}

export function DebugCard({ json, pending = false, className }: DebugCardProps) {
  return (
    <Card className={cn("flex min-h-0 flex-col", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Braces className="size-4 text-muted-foreground" />
          <CardTitle className="text-base">JSON (запрос + ответ)</CardTitle>
        </div>
        <CardDescription>
          Полный объект для отладки; с backend придёт та же форма в поле{" "}
          <code className="text-xs">response</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {json ? (
          <ScrollArea className="h-[min(220px,28vh)] w-full rounded-md border border-border bg-muted/40">
            <pre className="p-3 text-xs leading-relaxed text-foreground">
              {json}
            </pre>
          </ScrollArea>
        ) : pending ? (
          <p className="text-sm text-muted-foreground">
            Формируется mock-ответ…
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Отправьте форму, чтобы увидеть JSON.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
