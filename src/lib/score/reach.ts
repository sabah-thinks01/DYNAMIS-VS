/**
 * DYNAMIS — Reach Population Computation
 * Pure math function, zero dependencies.
 */

export function peopleInReach(densityPerSqKm: number, radiusKm: number): number {
  return Math.round(densityPerSqKm * Math.PI * radiusKm * radiusKm);
}
