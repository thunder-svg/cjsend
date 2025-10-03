// apps/web/src/components/ErrorBadge.tsx
import React from "react";
export function ErrorBadge({ message }: { message: string }) {
  return <p className="badge bad" role="alert">오류: {message}</p>;
}
