export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

const timeFmt = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(ts: number) {
  return dateFmt.format(ts);
}

export function formatTime(ts: number) {
  return timeFmt.format(ts);
}

export function relativeDay(ts: number) {
  const now = new Date();
  const d = new Date(ts);
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startOfSet = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
  ).getTime();
  const diffDays = Math.round((startOfToday - startOfSet) / 86_400_000);
  if (diffDays === 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return formatDate(ts);
}
