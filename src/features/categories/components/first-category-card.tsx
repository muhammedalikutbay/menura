"use client";

import { Tags } from "lucide-react";
import { useId, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createCategory } from "../actions";
import { CATEGORY_NAME_MAX, categorySchema } from "../schema";

/** Empty state of the menu builder: one card with an inline name field for the first category. */
export function FirstCategoryCard({ onCreated }: { onCreated: (category: { id: string; name: string }) => void }) {
  const formId = useId();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = categorySchema.safeParse({ name, isActive: true });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Kategori adı gerekli.");
      return;
    }
    setError(undefined);
    startTransition(async () => {
      const result = await createCategory({ name, isActive: true });
      if (result.ok) {
        toast.success("Kategori eklendi.");
        onCreated({ id: result.data.id, name: parsed.data.name });
      } else {
        setError(result.fieldErrors?.name?.[0] ?? result.error);
        toast.error(result.error);
      }
    });
  }

  return (
    <Card className="mx-auto w-full max-w-md items-center gap-5 px-6 py-10 text-center sm:py-10">
      <div
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-full bg-surface-muted text-fg-muted [&_svg]:size-6"
      >
        <Tags />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="type-title">İlk kategorinizi oluşturun</h2>
        <p className="type-body text-fg-muted">
          Ürünlerinizi gruplamak için bir kategori ekleyin; örneğin “Başlangıçlar” veya “İçecekler”.
        </p>
      </div>
      <form id={formId} onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-3 text-left">
        <Field label="Kategori adı" required error={error}>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={CATEGORY_NAME_MAX + 20}
            autoComplete="off"
            placeholder="Örn. Başlangıçlar"
            disabled={isPending}
          />
        </Field>
        <Button type="submit" loading={isPending}>
          Kategori ekle
        </Button>
      </form>
    </Card>
  );
}
