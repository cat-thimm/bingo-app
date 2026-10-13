import { useState } from 'react';

const KEY = 'bingo:name';

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}

export function usePlayerName() {
  const [name, setNameState] = useState(read);

  const setName = (value: string) => {
    setNameState(value);
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* Speicher nicht verfügbar – Name gilt nur für diese Sitzung */
    }
  };

  return [name, setName] as const;
}
