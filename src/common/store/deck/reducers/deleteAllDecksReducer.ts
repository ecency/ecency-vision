import { DeckState } from '../types';

export function deleteAllDecksReducer(state: DeckState): DeckState {
  return {
    ...state,
    items: [],
  };
}