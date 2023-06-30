
export interface Werteliste {
  Feld: string;
  FeldName: string;
  options: WertelisteOption[];
  Anlagengattung: string;
  data?: any;
}

export interface WertelisteOption<D = any> {
  Label: string;
  Value: D;
  disabled?: boolean;
  data?: D;
}

export interface WertenListenModel<T> {
  [key: string]: T[];
}
