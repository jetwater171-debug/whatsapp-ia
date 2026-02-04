export const formatPhone = (phone?: string | null) => {
  if (!phone) return "—";
  if (phone.length < 6) return phone;
  return `+${phone}`;
};

export const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};
