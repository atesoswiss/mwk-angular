import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MwkDialogConfig, MwkDialogTypes } from './mwk-dialog.config';
import { ThemePalette } from '@angular/material/core';

@Component({
  selector: 'mwk-dialog',
  styles: [`
    .wpl {
      white-space: pre-wrap;
    }
  `],
  template: `
    <h1 mat-dialog-title>{{data.title | translate}}</h1>
    <div mat-dialog-content *ngIf="data.message">
      <p class="wpl" *ngIf="!data.icon; else iconTemplate">{{data.message | translate}}</p>
    </div>
    <div mat-dialog-actions>
      <!-- CONFIRMATION MODE -->
      <ng-container *ngIf="data.type ===  MwkDialogTypes.CONFIRMATION">
        <button mat-button [mat-dialog-close]="false" >{{data.buttonText.no | translate}}</button>
        <button mat-raised-button cdkFocusInitial [mat-dialog-close]="true" [color]="raisedButtonColor">
          {{data.buttonText.yes | translate}}
        </button>
      </ng-container>
      
      <!-- NOTIFICATION MODE -->
      <ng-container *ngIf="data.type ===  MwkDialogTypes.NOTIFICATION">
        <button mat-raised-button cdkFocusInitial [mat-dialog-close]="true" [color]="raisedButtonColor">
          {{data.buttonText.ok | translate}}
        </button>
      </ng-container>
    </div>

    <ng-template #iconTemplate>
      <div class="w-100 d-flex flex-row align-items-center">
        <mat-icon class="mat-icon-48" [color]="data.icon.color">{{data.icon.materialIcon}}</mat-icon>
        <div class="wpl flex-grow-1 ms-4 text-wrap" [innerText]="data.message | translate"></div>
      </div>
    </ng-template>
  `
})
export class MwkDialog {

  readonly MwkDialogTypes = MwkDialogTypes;
  constructor(@Inject(MAT_DIALOG_DATA) public data: MwkDialogConfig) {
  }

  get raisedButtonColor(): ThemePalette{
    return this.data.raisedButtonColor || 'primary';
  }
}
