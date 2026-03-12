"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type CopyButtonProps = {
  plainText: string;
  markdown: string;
};

export function CopyButton({ plainText, markdown }: CopyButtonProps) {
  async function copyContent(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copied to clipboard.`);
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button type="button" variant="outline" size="sm" className="bg-white/70 px-3 py-2">
          <Copy className="h-4 w-4" />
          Copy
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={8}
          className="glass-card z-50 min-w-40 rounded-2xl p-2 shadow-xl"
        >
          <DropdownMenu.Item
            onSelect={() => void copyContent(plainText, "Plain text")}
            className="cursor-pointer rounded-xl px-3 py-2 text-sm outline-none hover:bg-white/80"
          >
            Copy as text
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => void copyContent(markdown, "Markdown")}
            className="cursor-pointer rounded-xl px-3 py-2 text-sm outline-none hover:bg-white/80"
          >
            Copy as markdown
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
