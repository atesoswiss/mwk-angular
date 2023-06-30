import { TranslateService } from '@ngx-translate/core';
import { ValidatorFn } from '@angular/forms';


export enum MwkDefaultColumns {
  SELECT = 'mwk-select'
}

export class MatTableConfig<T> {
  data: T;
  columns: string[] = [];
  filters: TableFilterConfig[];
  focusConfig: TableFocusConfig;
  translateService: TranslateService;
  customColumns?: string[] = [];
  selectable? = false;
  expandable? = false;
  storageConfig?: TableStorageConfig;
  editableConfig?: TableEditableConfig;
  groupingConfig?: TableGroupingConfig;

  constructor(initializer?: Partial<MatTableConfig<T>>) {
    Object.assign(this, initializer);
  }
}

export interface TableFilterConfig {
  labels: string[];
  fields?: string[]; // leave undefined to search through all fields
  type?: TableFilterType;
  optionFormatter?: (value: string) => string;
  values?: any[];
  isExplicit?: boolean;
}

export interface TableFilterOption {
  label: string;
  value: any;
}

export interface TableStorageConfig {
  identifier: string;
  storeSorting: boolean;
  storeFilters: boolean;
  storeTableRows?: boolean;
}

export interface TableFocusConfig {
  sessionStorageIdentifier: string;
  conditionKey: string;
  nbrOfSubRows?: number;
}

export enum TableFilterType {
  OPTION_LIST,
  TEXT,
  RANGE,
  TOGGLE
}

export interface TableEditableConfig {
  rowIdentifier: string;
  columns: (string | { column: string, valueFromColumn?: string, validators?: ValidatorFn[] })[];
  inputPropagationMode: TableEditableInputPropagationMode;
}

export enum TableEditableInputPropagationMode {
  MANUAL_PER_ENTRY,
  DIRECT
}

export interface TableGroupingConfig {
  rowIdentifier: string;
  columnSortingFields: string[];
}
