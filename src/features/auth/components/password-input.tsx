"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

/** Password field with a show/hide toggle. Forwards everything else to Input. */
export function PasswordInput({ className, ...props }: Omit<React.ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className={cn("pr-12", className)} />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Şifreyi gizle" : "Şifreyi göster"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-md text-fg-muted transition-colors hover:text-fg"
      >
        {visible ? <EyeOff aria-hidden="true" className="size-5" /> : <Eye aria-hidden="true" className="size-5" />}
      </button>
    </div>
  );
}
