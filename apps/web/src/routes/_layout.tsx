// apps/web/src/routes/_layout.tsx
import React from "react";
export function Layout(props:{title:string; children:React.ReactNode}) {
  return <div className="card"><h3>{props.title}</h3>{props.children}</div>;
}
