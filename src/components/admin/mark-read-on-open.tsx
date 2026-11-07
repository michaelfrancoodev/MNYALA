"use client";

import { useEffect } from "react";
import { markMessageReadOnOpenAction } from "@/server/actions/messages";

/** Opening a new message marks it read. A POST (server action), never a GET, so a link cannot do it to someone. */
export function MarkReadOnOpen({ id, unread }: { id: string; unread: boolean }) {
  useEffect(() => {
    if (unread) void markMessageReadOnOpenAction(id);
  }, [id, unread]);
  return null;
}
