import { z } from 'zod';

/** Nota de 0 a 10, em passos de 0.5 (ex.: 9.5) */
export const scoreSchema = z.number().min(0).max(10).multipleOf(0.5);
export type Score = z.infer<typeof scoreSchema>;

/**
 * O banco guarda notas em décimos (95 = 9.5) para evitar ponto flutuante.
 * Use estas funções na fronteira API ↔ banco.
 */
export const scoreToTenths = (score: number): number => Math.round(score * 10);
export const tenthsToScore = (tenths: number): number => tenths / 10;

export const VERDICTS = ['masterpiece', 'great', 'good', 'mixed', 'bad'] as const;
export const verdictSchema = z.enum(VERDICTS);
export type Verdict = z.infer<typeof verdictSchema>;

export const VERDICT_LABELS: Record<Verdict, string> = {
  masterpiece: 'OBRA-PRIMA',
  great: 'ÓTIMO',
  good: 'BOM',
  mixed: 'MISTO',
  bad: 'RUIM',
};

/** Faixas usadas em toda a interface (cards, página do jogo, bot do Discord…) */
export function verdictFromScore(score: number): Verdict {
  if (score >= 9) return 'masterpiece';
  if (score >= 8) return 'great';
  if (score >= 7) return 'good';
  if (score >= 5) return 'mixed';
  return 'bad';
}
