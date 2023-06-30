import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableConfig, MwkDefaultColumns } from './core/mat-table.config';
import { MatTableEditableHelperDirective } from './core/mat-table-editable-helper.directive';

@Component({
  selector: 'mwk-table',
  styleUrls: ['./mwk-table.component.scss'],
  templateUrl: 'mwk-table.component.html'
})
export class MwkTableComponent extends MatTableEditableHelperDirective implements OnInit {

  @Input()
  override data: any[];

  @Input()
  override config: MatTableConfig<any>;

  @Input()
  tableAriaDescription: string = "";

  readonly MwkDefaultColumns = MwkDefaultColumns;


  constructor(
    translateService: TranslateService,
    untypedFormBuilder: UntypedFormBuilder,
    matDialog: MatDialog) {
    super(
      translateService,
      untypedFormBuilder,
      matDialog
    )
  }


  override ngOnInit() {
    if (!this.config) {
      console.error('Add table config object');
      return;
    }
    super.ngOnInit();
    this.initTableSource();
  }

  onClick(row) {
    this.open.emit(row);
  }

}
