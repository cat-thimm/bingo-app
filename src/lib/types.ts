export type Cell = { text: string; checked: boolean };

export type Game = {
  id: string;
  code: string;
  title: string;
  size: number;
  created_by: string;
  created_at: string;
};

export type CardRow = {
  id: string;
  game_id: string;
  user_id: string;
  player_name: string;
  cells: Cell[];
  win_line: number[] | null;
  won_at: string | null;
  created_at: string;
  updated_at: string;
};
