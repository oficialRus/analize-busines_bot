import { Badge } from "@/components/ui/badge";
import type { AnalysisStatus } from "@/types";

const labels: Record<AnalysisStatus, string> = {
  idle: "Ожидание",
  loading: "В работе",
  success: "Готово",
  error: "Ошибка",
};

const variantMap: Record<
  AnalysisStatus,
  "default" | "secondary" | "outline" | "success" | "warning" | "destructive"
> = {
  idle: "outline",
  loading: "warning",
  success: "success",
  error: "destructive",
};

export interface StatusBadgeProps {
  status: AnalysisStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={variantMap[status]} className={className}>
      {labels[status]}
    </Badge>
  );
}
