const longDate = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const shortDate = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

export function formatDate(date: Date): string {
  return longDate.format(date);
}

export function formatShortDate(date: Date): string {
  return shortDate.format(date).toUpperCase();
}
