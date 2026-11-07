"use client";

import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button
      variant="primary"
      onClick={() => window.print()}
    >
      Print / Save PDF
    </Button>
  );
}
