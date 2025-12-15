import clubsData from './clubs.json';
import { Club } from './types';

export const getAllClubs = (): Club[] => {
  return clubsData as unknown as Club[];
};

export const getClubById = (id: string): Club | undefined => {
  const clubs = clubsData as unknown as Club[];
  
  // ROBUST FIX: Convert both sides to String() before comparing.
  // This ensures that "420940" (string) matches 420940 (number).
  return clubs.find((club) => String(club.Id) === String(id));
};