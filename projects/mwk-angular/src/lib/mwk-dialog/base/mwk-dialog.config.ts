import { ThemePalette } from '@angular/material/core';

export class MwkDialogConfig {

  title: string;
  message: string;
  type?:MwkDialogTypes = MwkDialogTypes.NOTIFICATION;
  buttonText?: {
    ok: 'Ok',
    no:'No',
    yes: 'Yes'
  }
  raisedButtonColor?: ThemePalette;
  icon?: {
    materialIcon: string;
    color: ThemePalette;
  };

  constructor(initializer: MwkDialogConfig) {
    Object.assign(this, initializer);
  }
}

export enum MwkDialogTypes{
  NOTIFICATION,
  CONFIRMATION
}
