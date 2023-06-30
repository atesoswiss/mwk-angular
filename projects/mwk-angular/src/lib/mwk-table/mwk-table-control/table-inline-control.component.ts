import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {InlineControlInputType} from './inline-control-input-type.enum';
import {MatFormField} from '@angular/material/form-field';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import {TranslateService} from "@ngx-translate/core";
import { TableInlineControlData } from '../core/mat-table-editable-helper.directive';
import { WertelisteOption } from '../../core/werteliste.model';

export class TableInlineControlChangeEvent<T> {
  value: any;
  inlineControlData: TableInlineControlData<T>;
}

@Component({
  selector: 'app-table-inline-control',
  templateUrl: './table-inline-control.component.html',
  styleUrls: ['./table-inline-control.component.scss']
})
export class TableInlineControlComponent<T> {
  @ViewChild(MatFormField) formField: MatFormField;
  @ViewChild(MatFormField, {read: ElementRef}) formFieldRef: ElementRef;
  @ViewChild(CdkTextareaAutosize) cdkTextareaAutosize: CdkTextareaAutosize;

  @Input() inlineControlData: TableInlineControlData<T>;
  @Input() controlName: string;
  @Input() displayControlName: string;
  @Input() inputType: InlineControlInputType;
  @Input() fixedInputWidth: number;
  @Input() forceTextOnly = false;

  @Input()
  set isBeingProcessed(value: boolean) {
    this._isBeingProcessed = value;
    if (this.isBeingProcessed) {
      this.inlineControlData.fromGroup.get(this.controlName).valueChanges.subscribe(
        (controlValue => this.controlChanges.emit({
          value: controlValue,
          inlineControlData: this.inlineControlData
        } as TableInlineControlChangeEvent<T>))
      );

      const firstEntry = this.inlineControlData?.columns?.length ? this.inlineControlData.columns[0] : null;
      if (firstEntry === this.controlName) {
        // Workaround for ios focus after hidden input
        setTimeout(() => {
          const inputField = this.formFieldRef?.nativeElement?.querySelector(this.htmlTagByInputType);
          if (inputField) {
            inputField.focus();
          }
        });
      }

      // Workaround check: https://github.com/angular/components/issues/5222
      setTimeout(() => this.cdkTextareaAutosize?.resizeToFitContent(true), 1);
    }
  }

  get isBeingProcessed() {
    return this._isBeingProcessed;
  }

  @Input()
  set options(options: WertelisteOption[]) {
    this._options = options;
  }

  get options(): WertelisteOption[] {
    return this._options || this.inlineControlData?.options || [];
  }

  private _isBeingProcessed: boolean;
  private _options: WertelisteOption[];

  readonly InlineControlInputType = InlineControlInputType;

  @Output() controlChanges: EventEmitter<TableInlineControlChangeEvent<T>> = new EventEmitter<TableInlineControlChangeEvent<T>>();
  @Output() selectionDataChange: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private translateService: TranslateService
  ) {
  }

  get htmlTagByInputType() {
    switch (this.inputType) {
      case InlineControlInputType.TEXTAREA:
        return 'textarea';
      case InlineControlInputType.SELECT:
        return 'mat-select';
      default:
        return 'input';
    }
  }

  get optionLabel(): string {
    return this.options?.find(option => option.Value === this.inlineControlData.data[this.controlName])?.Label;
  }

  get isPreview() {
    if (this.isBeingProcessed !== undefined) {
      return !this.isBeingProcessed || this.forceTextOnly;
    } else {
      return !this.inlineControlData.isBeingProcessed || this.forceTextOnly;
    }
  }
}
