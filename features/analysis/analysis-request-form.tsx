"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  analysisFormPresets,
  analysisFormSchema,
  defaultAnalysisFormValues,
  type AnalysisFormValues,
  type AnalysisPayload,
} from "@/lib/analysis-request-schema";
import { cn } from "@/lib/utils";

const selectClassName = cn(
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

const operationOptions: { value: AnalysisFormValues["operation"]; label: string }[] =
  [
    { value: "text_search", label: "Текстовый поиск" },
    { value: "geocode", label: "Геокодирование" },
    { value: "reverse_geocode", label: "Обратное гео" },
    { value: "organizations_nearby", label: "Организации рядом" },
  ];

export interface AnalysisRequestFormProps {
  onValidatedSubmit: (payload: AnalysisPayload) => void;
  onFormReset: () => void;
}

export function AnalysisRequestForm({
  onValidatedSubmit,
  onFormReset,
}: AnalysisRequestFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AnalysisFormValues, unknown, AnalysisPayload>({
    resolver: zodResolver(analysisFormSchema),
    defaultValues: defaultAnalysisFormValues,
  });

  const operation = useWatch({ control, name: "operation" });

  const showQuery =
    operation === "text_search" || operation === "geocode";
  const showCoords =
    operation === "reverse_geocode" || operation === "organizations_nearby";
  const showRadius = operation === "organizations_nearby";

  return (
    <form
      className="flex min-h-0 flex-1 flex-col gap-4"
      onSubmit={handleSubmit((payload) => {
        onValidatedSubmit(payload);
      })}
      noValidate
    >
      <ScrollArea className="min-h-0 flex-1 pr-3">
        <div className="space-y-4 pb-1">
          <div className="space-y-2">
            <Label htmlFor="provider">Провайдер</Label>
            <select
              id="provider"
              className={selectClassName}
              {...register("provider")}
            >
              <option value="2gis">2GIS</option>
              <option value="yandex">Яндекс</option>
            </select>
            {errors.provider ? (
              <p className="text-xs text-destructive">{errors.provider.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="operation">Операция</Label>
            <select
              id="operation"
              className={selectClassName}
              {...register("operation")}
            >
              {operationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.operation ? (
              <p className="text-xs text-destructive">{errors.operation.message}</p>
            ) : null}
          </div>

          {showQuery ? (
            <div className="space-y-2">
              <Label htmlFor="query">Запрос / адрес</Label>
              <Input
                id="query"
                type="text"
                autoComplete="off"
                placeholder="Например: кафе Невский"
                {...register("query")}
              />
              {errors.query ? (
                <p className="text-xs text-destructive">{errors.query.message}</p>
              ) : null}
            </div>
          ) : null}

          {showCoords ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="latitude">Широта</Label>
                <Input
                  id="latitude"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="55.7558"
                  {...register("latitude")}
                />
                {errors.latitude ? (
                  <p className="text-xs text-destructive">
                    {errors.latitude.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Долгота</Label>
                <Input
                  id="longitude"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  placeholder="37.6173"
                  {...register("longitude")}
                />
                {errors.longitude ? (
                  <p className="text-xs text-destructive">
                    {errors.longitude.message}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {showRadius ? (
            <div className="space-y-2">
              <Label htmlFor="radius">Радиус (м)</Label>
              <Input
                id="radius"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="500"
                {...register("radius")}
              />
              {errors.radius ? (
                <p className="text-xs text-destructive">{errors.radius.message}</p>
              ) : null}
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="limit">Лимит результатов</Label>
            <Input
              id="limit"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="10"
              {...register("limit")}
            />
            {errors.limit ? (
              <p className="text-xs text-destructive">{errors.limit.message}</p>
            ) : null}
          </div>
        </div>
      </ScrollArea>

      <Separator />

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Быстрые пресеты
        </p>
        <div className="flex flex-wrap gap-2">
          {analysisFormPresets.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                reset(preset.values);
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit">Отправить</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            reset(defaultAnalysisFormValues);
            onFormReset();
          }}
        >
          Сбросить
        </Button>
      </div>
    </form>
  );
}
