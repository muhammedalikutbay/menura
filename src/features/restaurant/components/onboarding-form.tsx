"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { fromZodError, type FieldErrors } from "@/lib/action-result";
import { useFocusInvalid } from "@/features/auth/components/use-focus-invalid";
import { slugify } from "@/lib/text";
import { createRestaurant } from "../actions";
import { createRestaurantSchema } from "../schema";
import { displayHost } from "../slug-input";
import { SlugField } from "./slug-field";

export function OnboardingForm({ appUrl }: { appUrl: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [redirecting, setRedirecting] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  // Once the user edits the slug by hand we stop deriving it from the name (until they clear it).
  const [slugEdited, setSlugEdited] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const { formRef, requestFocus } = useFocusInvalid();

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function handleSlugChange(value: string) {
    setSlug(value);
    setSlugEdited(value !== "");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = createRestaurantSchema.safeParse({ name, slug });
    if (!parsed.success) {
      setErrors(fromZodError(parsed.error).fieldErrors);
      requestFocus();
      return;
    }
    setErrors({});

    startTransition(async () => {
      try {
        const result = await createRestaurant(parsed.data);
        if (!result.ok) {
          setErrors(result.fieldErrors ?? {});
          if (!result.fieldErrors) toast.error(result.error);
          else requestFocus();
          return;
        }
        setRedirecting(true);
        router.push("/dashboard" as Route);
        router.refresh();
      } catch {
        toast.error("Restoran oluşturulamadı. Lütfen tekrar deneyin.");
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <Field label="Restoran adı" error={errors.name} required>
        <Input
          value={name}
          onChange={(event) => handleNameChange(event.target.value)}
          autoComplete="organization"
          placeholder="Örn. Deniz Balık Restoran"
          maxLength={80}
          autoFocus
        />
      </Field>

      <SlugField value={slug} onChange={handleSlugChange} host={displayHost(appUrl)} error={errors.slug} />

      <Button type="submit" size="lg" loading={isPending || redirecting}>
        Restoranı oluştur
      </Button>
    </form>
  );
}
