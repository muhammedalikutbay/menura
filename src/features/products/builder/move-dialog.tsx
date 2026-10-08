"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type MoveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count: number;
  categories: { id: string; name: string }[];
  /** Return `false` to keep the dialog open (the caller reports the error). */
  onConfirm: (categoryId: string) => Promise<false | void>;
};

/** "Taşı" from the bulk bar: pick the category the selected products move to. */
export function MoveDialog({ open, onOpenChange, count, categories, onConfirm }: MoveDialogProps) {
  const [target, setTarget] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!target) return;
    startTransition(async () => {
      const result = await onConfirm(target);
      if (result !== false) onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent title="Kategoriye taşı" description={`${count} ürün seçilen kategorinin sonuna taşınır.`}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger aria-label="Hedef kategori">
              <SelectValue placeholder="Kategori seçin" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isPending}>
              Vazgeç
            </Button>
            <Button type="submit" loading={isPending} disabled={!target}>
              Taşı
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
