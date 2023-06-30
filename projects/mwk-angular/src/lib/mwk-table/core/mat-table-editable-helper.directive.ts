import { AfterViewInit, Directive, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { forkJoin, Observable, of, Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { MatTableHelperDirective } from './mat-table-helper.directive';
import { TableEditableConfig, TableEditableInputPropagationMode } from './mat-table.config';
import { WertelisteOption } from '../../core/werteliste.model';
import { InlineControlInputType } from '../mwk-table-control/inline-control-input-type.enum';
import { MwkDialog } from '../../mwk-dialog/base/mwk-dialog';
import { MwkDialogConfig } from '../../mwk-dialog/base/mwk-dialog.config';
import { formValidate } from '../../core/generics.helper';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';


export interface TableInlineControlData<T> {
  data: T,
  fromGroup: UntypedFormGroup,
  isBeingProcessed: boolean;
  columns: any[];
  options?: WertelisteOption[];
}

@Directive()
export abstract class MatTableEditableHelperDirective extends MatTableHelperDirective implements OnInit, AfterViewInit, OnDestroy {

  private isBeingProcessed: { key: string, value: boolean }[] = [];
  private isLoading: { key: string, value: boolean }[] = [];
  private formGroupArray: { key: string, value: UntypedFormGroup }[] = [];
  private changeSubscriptions: Subscription[] = [];

  editableConfig: TableEditableConfig;

  readonly InlineControlInputType = InlineControlInputType;


  private formBuilder: UntypedFormBuilder;
  private matDialog: MatDialog

  constructor(
    translateService: TranslateService,
    untypedFormBuilder: UntypedFormBuilder,
    matDialog: MatDialog
  ) {
    super(translateService);
    this.formBuilder = untypedFormBuilder;
    this.matDialog = matDialog;
  }

  ngOnDestroy() {
    this.changeSubscriptions.forEach(subscription => subscription.unsubscribe());
  }

  override ngOnInit() {
    this.editableConfig = this.config.editableConfig;
    super.ngOnInit();

  }

  override initTableSource() {
    this.initTableDataSource(this.data);
    super.initTableSource();
  }

  private initTableDataSource(dataList: any[]) {
    this.isBeingProcessed = [];
    this.isLoading = [];
    this.formGroupArray = [];
    this.changeSubscriptions = [];
    // prepare editor options
    dataList.forEach(entry => {
      const key = entry[this.editableConfig.rowIdentifier]
      this.isBeingProcessed.push({ key, value: false });
      this.isLoading.push({ key, value: false });
      this.formGroupArray.push({ key, value: this.initFormGroup(entry, key) });
    });
    // Default sort based on key
    dataList.sort((a, b) => a[this.editableConfig.rowIdentifier].toString().localeCompare(
      b[this.editableConfig.rowIdentifier].toString(),
      undefined,
      {
        numeric: true,
        sensitivity: 'base'
      }
    ));
  }

  initFormGroup(entry, key): UntypedFormGroup {
    const form = this.formBuilder.group({});
    this.editableConfig.columns.forEach(column => {
      const mainColumn = typeof column === 'object' ? column.column : column;
      const valueColumn = typeof column === 'object' ? (column.valueFromColumn || column.column) : column;
      const value = entry[valueColumn] || null;
      const validators = typeof column === 'object' ? column.validators : null;
      form.addControl(mainColumn, this.formBuilder.control(value, { validators }));
    });

    // Directly replaces the values in the specific AuftragModel with the new user inputs from the FormGroup using the value changes subscription
    if (this.editableConfig.inputPropagationMode === TableEditableInputPropagationMode.DIRECT) {
      const changeSubscription = form.valueChanges.subscribe(fromGroupValues => {
        Object.entries(fromGroupValues).forEach(value => {
          const rowData = this.tableDataSource.data.find(auftrag => auftrag[this.editableConfig.rowIdentifier] === key);
          if (rowData && rowData[value[0]] !== value[1]) {
            rowData[value[0]] = value[1];
          }
        });
      });
      this.changeSubscriptions.push(changeSubscription);
    }

    return form;
  }

  editRow(row: any) {
    const activeRowConfig = this.isBeingProcessed.find(entry => entry.value);
    if (activeRowConfig) {
      // Check if the newly selected row is not the previous selected row
      if (activeRowConfig.key !== row[this.editableConfig.rowIdentifier]) {
        // Check if there are unsaved changes
        const activeRow = this.tableDataSource.data.find(entry => entry[this.editableConfig.rowIdentifier] === activeRowConfig.key);
        if (activeRow) {
          const doCheckChanges = this.editableConfig.inputPropagationMode != TableEditableInputPropagationMode.DIRECT ? this.checkForUnsavedChanges(activeRow) : of(true);
          doCheckChanges.subscribe(result => {
            if (result) {
              if (this.editableConfig.inputPropagationMode !== TableEditableInputPropagationMode.DIRECT) {
                this.getFormGroupByRow(activeRow).reset(activeRow);
                this.getFormGroupByRow(activeRow).markAsPristine();
              }
              activeRowConfig.value = false;
              this.selectRow(row);
            }
          });
        } else {
          this.selectRow(row);
        }
      }
    } else {
      this.selectRow(row);
    }
  }

  private selectRow(row: any) {
    const selected = this.isBeingProcessed.find(entry => entry.key === row[this.editableConfig.rowIdentifier]);
    if (selected) {
      selected.value = true;
    }
  }

  private checkForUnsavedChanges(row: any): Observable<boolean> {
    if (row && this.getFormGroupByRow(row)?.dirty) {
      return this.warn();
    }
    return of(true)
  }

  checkTableForUnsavedChanges(): Observable<boolean> {
    if (this.tableDataSource?.data?.length) {
      return forkJoin(this.tableDataSource.data.map(row => this.checkForUnsavedChanges(row))).pipe(
        map(entry => entry.every(bool => bool))
      )
    }
    return of(true);
  }

  updateTableDataSource(row: any) {
    // Method checks if data changed on specifc field and patches the values - prevents change events on fields which have same data as before
    Object.entries(this.getFormGroupByRow(row).controls).forEach(([key, control]) => {
      if (row[key] && control.value !== row[key]) {
        control.patchValue(row[key]);
      }
    });
    this.getFormGroupByRow(row).markAsPristine();
    const sourceIdx = this.tableDataSource.data.findIndex(entry => entry[this.editableConfig.rowIdentifier] === row[this.editableConfig.rowIdentifier]);
    this.tableDataSource.data[sourceIdx] = row;
    this.tableDataSource.data = [...this.tableDataSource.data];
  }

  setLoading(row: any, isLoading: boolean) {
    this.isLoading.find(entry => entry.key === row[this.editableConfig.rowIdentifier]).value = isLoading;
    if (isLoading) {
      this.getFormGroupByRow(row).disable();
    } else {
      this.getFormGroupByRow(row).enable();
    }
  }

  unselectAll(event, row?: any) {
    event?.stopPropagation();
    if (row) {
      this.getFormGroupByRow(row).reset(row);
    }
    this.isBeingProcessed.forEach(entry => entry.value = false);
  }

  isRowBeingProcessed(row: any): boolean {
    return this.isBeingProcessed.find(entry => entry.key === row[this.editableConfig.rowIdentifier])?.value || false;
  }

  isRowLoading(row: any): boolean {
    return this.isLoading.find(entry => entry.key === row[this.editableConfig.rowIdentifier])?.value || false;
  }

  getFormGroupByRow(row: any): UntypedFormGroup {
    return this.formGroupArray.find(entry => entry.key === row[this.editableConfig.rowIdentifier])?.value || null;
  }

  getInlineControlData(row: any, selectorListField?: string): TableInlineControlData<any> {
    return {
      data: row,
      columns: this.editableConfig.columns,
      fromGroup: this.getFormGroupByRow(row),
      isBeingProcessed: this.isRowBeingProcessed(row)
    };
  }

  get activeRow(): any {
    return this.tableDataSource.data.find(row => row[this.editableConfig.rowIdentifier] === this.isBeingProcessed.find(entry => entry.value)?.key);
  }

  private warn(): Observable<boolean> {
    const dialog = this.matDialog.open(MwkDialog, {
      panelClass: 'mat-dialog-sm',
      data: new MwkDialogConfig({
        message: 'There are unsaved changes. Do you want to proceed?',
        title: 'Unsaved changes'
      })
    });

    return dialog.beforeClosed();
  }

  get isAnyFormInvalid() {
    return this.formGroupArray.some(entry => entry.value.invalid);
  }

  get forms() {
    return this.formGroupArray;
  }

  validateActiveForm() {
    this.formGroupArray.forEach(entry => formValidate(entry.value));
  }
}
