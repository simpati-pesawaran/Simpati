import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  return `${hours}:${minutes}`;
}

export function formatDateTime(date: Date | string, time?: string): string {
  const formattedDate = formatDate(date);
  if (time) {
    return `${formattedDate}, ${formatTime(time)}`;
  }
  return formattedDate;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = parseInt(start1.replace(":", ""));
  const e1 = parseInt(end1.replace(":", ""));
  const s2 = parseInt(start2.replace(":", ""));
  const e2 = parseInt(end2.replace(":", ""));

  return (s1 < e2 && e1 > s2);
}
