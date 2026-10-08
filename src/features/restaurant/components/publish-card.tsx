"use client";

import { ExternalLink } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useId, useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Switch } from "@/components/ui/switch";
import { setPublished } from "../actions";

type PublishCardProps = { isPublished: boolean; slug: string };

export function PublishCard({ isPublished: initial, slug }: PublishCardProps) {
  const switchId = useId();
  const [isPending, startTransition] = useTransition();
  const [isPublished, setIsPublished] = useState(initial);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function apply(next: boolean) {
    startTransition(async () => {
      try {
        const result = await setPublished({ isPublished: next });
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        setIsPublished(result.data.isPublished);
        toast.success(next ? "Menünüz yayında." : "Menü yayından kaldırıldı.");
      } catch {
        toast.error("Durum güncellenemedi. Lütfen tekrar deneyin.");
      }
    });
  }

  function handleToggle(next: boolean) {
    // Taking the menu offline affects guests immediately, so ask first.
    if (next) apply(true);
    else setConfirmOpen(true);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Yayın durumu</CardTitle>
          <Badge variant={isPublished ? "success" : "neutral"}>{isPublished ? "Yayında" : "Taslak"}</Badge>
        </div>
        <CardDescription>
          Yayındayken menünüzü QR kodu okutan herkes görebilir. Taslakta menü misafirlere “Menü bulunamadı” olarak
          görünür; siz hazırlanırken içeriği güvenle düzenleyebilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor={switchId} className="text-sm leading-5 font-medium">
            Menüyü yayınla
          </label>
          <Switch id={switchId} checked={isPublished} onCheckedChange={handleToggle} disabled={isPending} />
        </div>
        <Link
          href={`/m/${slug}` as Route}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-8 items-center gap-1.5 self-start rounded-sm text-sm font-medium text-accent-text hover:underline"
        >
          Menüyü görüntüle
          <ExternalLink aria-hidden="true" className="size-3.5" />
          <span className="sr-only">(yeni sekmede açılır)</span>
        </Link>
      </CardContent>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Menü yayından kaldırılsın mı?"
        description="Menü misafirlere “Menü bulunamadı” olarak görünür. QR kodlarınız çalışmaya devam eder; yeniden yayınladığınızda menü tekrar açılır."
        confirmLabel="Yayından kaldır"
        destructive
        onConfirm={() => apply(false)}
      />
    </Card>
  );
}
