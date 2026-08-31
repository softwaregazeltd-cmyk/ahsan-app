import type { ComponentProps } from "react";
import { Pill } from "./components/Pill";

export function statusTone(status: string): ComponentProps<typeof Pill>["tone"] {
  switch (status) {
    case "In progress": return "primary";
    case "Completed": return "ok";
    case "On Hold": return "amber";
    case "Cancelled": return "red";
    default: return "primary"; // Planning
  }
}