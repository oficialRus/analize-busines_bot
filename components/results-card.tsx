import { Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { MockSubmitViewModel } from "@/lib/mock-submit-result";
import { cn } from "@/lib/utils";

export interface ResultsCardProps {
  data: MockSubmitViewModel | null;
  className?: string;
}

export function ResultsCard({ data, className }: ResultsCardProps) {
  return (
    <Card className={cn("flex min-h-0 flex-col", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-muted-foreground" />
          <CardTitle className="text-base">ResultsCard</CardTitle>
        </div>
        <CardDescription>Mock-ответ после успешного submit.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        {data ? (
          <>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {data.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {data.summary}
              </p>
            </div>
            <Separator />
            <ul className="space-y-1 text-xs text-muted-foreground">
              {data.meta.map((line) => (
                <li key={line} className="font-mono">
                  {line}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Здесь появится демо-результат после валидации формы.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
