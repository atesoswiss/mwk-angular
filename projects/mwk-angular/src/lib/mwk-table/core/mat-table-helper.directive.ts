import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';
import { MatRow, MatTable, MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { MatTableConfig, MwkDefaultColumns, TableFilterConfig, TableFilterType } from './mat-table.config';
import { deepCopy } from '../../core/generics.helper';

@Directive()
export abstract class MatTableHelperDirective implements OnInit, AfterViewInit {

  @ViewChild(MatSort)
  set tableSort(sort: MatSort) {
    this.tableDataSource.sort = sort;
    this.tableDataSource.sort?.sortChange.subscribe($event => this.onSortChange($event));
    if (!this.lastSort || (this.lastSort && this.lastSort?.active !== sort?.active && this.lastSort.direction !== sort?.direction)) {
      if (this.tableDataSource?.sort) {
        setTimeout(() => this.sortFromLocalStorage(this.tableDataSource.sort));
      }
    }
    this.lastSort = sort;
  }

  @ViewChildren(MatRow, { read: ElementRef })
  matRows: QueryList<ElementRef>;

  @ViewChild(MatTable)
  table: MatTable<any>;

  @Input()
  data: any[];

  @Input()
  config: MatTableConfig<any>;

  @Output()
  open: EventEmitter<any> = new EventEmitter<any>();

  lastSort: MatSort;
  tableDataSource = new MatTableDataSource<any>();
  tableSelection = new SelectionModel<any>(true, []);
  translateService: TranslateService;
  automaticallyGeneratedColumns: string[];

  public static rowStorageIdentifier = 'tableRowStorageItem';
  public static parentTableFocusIdentifier = 'parentTableFocusIdentifier';

  get filteredData() {
    return this.tableDataSource?.filteredData.filter(entry => this.isNotGroup(0, entry));
  }

  constructor(translateService: TranslateService) {
    this.translateService = translateService;
  }

  ngOnInit() {
    this.setColumns();
    this.setSortingDataAccessor();
    this.setFilterPredicate();
  }

  initTableSource() {
    this.tableDataSource.data = this.data;
  }

  setColumns() {
    if (!this.config.columns?.length) {
      this.config.columns = this.data.map(entry => Object.keys(entry)).reduce((acc, current) => {
        acc.forEach((acc_val, index) => {
          if (!current.includes(acc_val)) {
            acc.splice(index, 1);
          }
        });
        return acc;
      });
    }

    this.automaticallyGeneratedColumns = deepCopy(this.config.columns);

    if (!this.config.columns.includes(MwkDefaultColumns.SELECT)) {
      this.config.columns.unshift(MwkDefaultColumns.SELECT);
    }
  }

  ngAfterViewInit() {
    // Execute row focus after table connected itself to updated data source
    this.tableDataSource.connect().subscribe(() =>
      setTimeout(() => this.setFocus(), 100)
    );

    // Remove stored tableRows
    if (this.config?.storageConfig?.identifier && this.config?.storageConfig?.storeTableRows) {
      window.sessionStorage.removeItem(MatTableHelperDirective.rowStorageIdentifier);
      window.sessionStorage.removeItem(MatTableHelperDirective.parentTableFocusIdentifier);
    }

    // Store table data according to configs before routing to a specific table object
    this.open.subscribe(row => {
      if (this.config?.focusConfig) {
        const focusSessionStorageKey = this.config?.focusConfig?.sessionStorageIdentifier
        if (Array.isArray(row)) {
          MatTableHelperDirective.setFocusItem(focusSessionStorageKey, `${row[0][this.config?.focusConfig?.conditionKey]}`);
        } else {
          MatTableHelperDirective.setFocusItem(focusSessionStorageKey, `${row[this.config?.focusConfig?.conditionKey]}`);
        }
      }

      if (this.config?.storageConfig?.identifier && this.config?.storageConfig?.storeTableRows) {
        this.setTableRowsItem();
      }
    });
  }

  onFilterChanges($event: TableFilterConfig[]) {
    // Unfortunately, we can only trigger the refiltering with a string pattern:
    this.tableDataSource.filter = JSON.stringify($event);
  }

  areAllSelected() {
    return this.tableSelection.selected.length >= this.tableDataSource.filteredData.length;
  }

  toggleAll() {
    this.areAllSelected() ? this.tableSelection.clear() : this.tableDataSource.filteredData.forEach(row => this.tableSelection.select(row));
  }

  isGroup(index, item): boolean {
    return item?.group;
  }

  isNotGroup(index, item): boolean {
    return !item?.group;
  }

  private onSortChange($event: Sort) {
    if (this.config?.storageConfig?.storeSorting) {
      const identifier = `S(${this.config?.storageConfig?.identifier})`;
      const obj: Sort = JSON.parse(localStorage.getItem(identifier));
      if (obj) {
        localStorage.removeItem(identifier);
      }
      if ($event.direction) {
        localStorage.setItem(identifier, JSON.stringify($event));
      }
    }
  }

  public setFocus() {
    if (this.config?.focusConfig && this.tableDataSource?.data?.length) {
      const storedId = window.sessionStorage.getItem(this.config?.focusConfig?.sessionStorageIdentifier);
      if (storedId) {
        let data = this.tableDataSource.filteredData;
        if (this.tableDataSource.sort) {
          data = this.tableDataSource.sortData(this.tableDataSource.filteredData, this.tableDataSource.sort);
        }
        const index = data.findIndex(element => `${element[this.config?.focusConfig?.conditionKey]}` === storedId);
        // Cleans index number if subrows are defined in table
        let cleanedIndex = index;
        if (this.config?.focusConfig?.nbrOfSubRows > 0) {
          cleanedIndex = index * (this.config?.focusConfig?.nbrOfSubRows + 1);
        }
        // Searches html row based on ElementRef to scroll and focus
        const rowResult = this.matRows.toArray().find((element: ElementRef) => element.nativeElement.rowIndex === cleanedIndex + 1);
        if (rowResult) {
          rowResult.nativeElement.focus();
          rowResult.nativeElement.scrollIntoViewIfNeeded();
          rowResult.nativeElement.className += ' mwk-last-visited';
        }
        window.sessionStorage.removeItem(this.config?.focusConfig?.sessionStorageIdentifier);
      }
    }
  }

  private sortFromLocalStorage(matSort: MatSort) {
    if (this.config?.storageConfig?.storeSorting) {
      const identifier = `S(${this.config?.storageConfig?.identifier})`;
      const sort: Sort = JSON.parse(localStorage.getItem(identifier));
      if (sort?.direction) {
        matSort.sort({
          id: null,
          start: sort.direction,
          disableClear: false
        });
        matSort.sort({
          id: sort.active,
          start: sort.direction,
          disableClear: false
        });
        // Workaround to display sorting arrows: https://github.com/angular/components/issues/10242#issuecomment-470726829
        (matSort?.sortables?.get(sort.active) as MatSortHeader)?._setAnimationTransitionState({ toState: 'active' });
      }
    }
  }

  private setSortingDataAccessor() {
    this.tableDataSource.sortingDataAccessor = (item, property) => {
      const hasGroup = this.tableDataSource.filteredData.some(entry => entry['group'] === true);
      const value = this.getPropertyValue(item, property);
      if (hasGroup && this.config?.groupingConfig) {
        const identifierSuffix = `${item[this.config?.groupingConfig?.rowIdentifier]}`
        const suffixAdditions = this.config?.groupingConfig?.columnSortingFields.map(field => item[field]).join('-');
        const suffix = suffixAdditions?.length ? `${identifierSuffix}-${suffixAdditions}` : identifierSuffix;
        if (value && item['group'] === true) {
          return value;
        } else if (value && value instanceof Date) {
          return `${value.getTime()}-${suffix}`;
        } else {
          return `${this.sortingAccessorBasic(value)}-${suffix}`;
        }
      }
      return this.sortingAccessorBasic(value);
    };
  }

  private sortingAccessorBasic(value) {
    if (value && typeof value === 'object' && value[this.translateService.currentLang]) {
      // Translatable business property:
      return value[this.translateService.currentLang]?.toString()?.toLowerCase();
    } else if (value && typeof value === 'string') {
      // Sort string case insensitive
      return value.toLowerCase();
    } else {
      return value;
    }
  }

  private setFilterPredicate() {
    this.tableDataSource.filterPredicate = (data: any[], filter: string) => {
      let criterias: TableFilterConfig[];
      try {
        criterias = JSON.parse(filter);
      } catch (e) {
        /* ignore */
      }

      if (criterias && Array.isArray(criterias)) {
        // Filter by criteria:
        const activeCriteria = criterias.filter(config => config.values && config.values.length);
        if (activeCriteria.length) {
          return this.evaluateCriteria(activeCriteria, data, filter);
        } else {
          return true;
        }
      } else {
        // Filter by pattern:
        const found: string = this.config?.columns?.find((field: string) => {
          if (typeof data[field] === 'string') {
            return data[field] && (data[field].toLowerCase().indexOf(filter.toLowerCase()) !== -1 || !filter.toLowerCase());
          } else if (typeof data[field] === 'object' && this.isBusinessTranslationsType(data[field])) {
            return data[field] && (data[field][this.translateService.currentLang].toLowerCase().indexOf(filter.toLowerCase()) !== -1 || !filter.toLowerCase());
          }
          return false;
        });
        return !!found;
      }
    };
  }

  private evaluateCriteria(activeCriteria: TableFilterConfig[], data: any[], filter: string) {
    if (activeCriteria.length) {
      let criteriaResult = true;
      activeCriteria.forEach(criteria => {

        if (criteria.type === TableFilterType.RANGE) {
          if (criteria.values[0] != null) {
            criteriaResult = criteriaResult && data[criteria.fields[0]] >= criteria.values[0];
          }
          if (criteria.values[1] != null) {
            criteriaResult = criteriaResult && data[criteria.fields[1]] <= criteria.values[1];
          }
        } else {
          let field; // allow undefined value when searching through all provided columns
          if (criteria.fields) {
            field = criteria.fields[0];
          }
          let criteriaValuesResult = 0;
          criteriaValuesResult = criteria.values.findIndex(filterValue => {
            if (criteria.type === TableFilterType.TEXT) {
              if (field) {
                // match one object property
                return this.getTextFilterMatch(data[field], criteriaValuesResult, filterValue, filter, activeCriteria);
              } else {
                // match any object properties
                return Object.keys(data).some(key => this.getTextFilterMatch(data[key], criteriaValuesResult, filterValue, filter, activeCriteria));
              }
            } else if (data[field] instanceof Array) {
              return data[field].some(subField => this.validateProperty(subField, criteriaValuesResult, filterValue, filter, activeCriteria));
            } else {
              return this.validateProperty(data[field], criteriaValuesResult, filterValue, filter, activeCriteria);
            }
          });
          // With this restrictive search current datarow only passes filtering if:
          // - any of the values match
          // - all of the criteria have a match
          criteriaResult = criteriaResult && criteriaValuesResult > -1;
        }
      });
      return criteriaResult;
    } else {
      return true;
    }
  }

  private validateProperty(property, criteriaValuesResult, filterValue, filter, activeCriteria) {
    if (typeof property === 'number') {
      return criteriaValuesResult || property === filterValue || !filter.toLowerCase();
    } else if (typeof property === 'boolean') {
      return property === filterValue;
    } else if (property instanceof Date) {
      return new Date(property).getTime() === new Date(filterValue).getTime();
    } else {
      return this.getTextFilterMatch(property, criteriaValuesResult, filterValue, filter, activeCriteria);
    }
  }

  private getTextFilterMatch(property, criteriaValuesResult, filterValue, filter, activeCriteria) {
    if (typeof property === 'object' && property[this.translateService.currentLang]) {
      return criteriaValuesResult || property[this.translateService.currentLang].toLowerCase().indexOf(filterValue.toLowerCase()) !== -1 || !filter.toLowerCase();
    } else if (typeof property === 'string') {
      if (activeCriteria?.length && activeCriteria[0]?.isExplicit) {
        return criteriaValuesResult || property.toLowerCase() === filterValue.toLowerCase() || !filter.toLowerCase();
      } else {
        return criteriaValuesResult || property.toLowerCase().indexOf(filterValue.toLowerCase()) !== -1 || !filter.toLowerCase();
      }

    }
  }

  private getPropertyValue(obj, path) {
    return path.split('.').reduce((o, p) => o && o[p], obj);
  }

  public static setFocusItem(key: string, value: any): void {
    window.sessionStorage.setItem(key, value);
  }

  private setTableRowsItem(): void {
    window.sessionStorage.setItem(MatTableHelperDirective.rowStorageIdentifier, JSON.stringify(this.tableDataSource.sortData(this.tableDataSource.filteredData, this.tableDataSource.sort)));
    if (this.config?.focusConfig?.sessionStorageIdentifier) {
      window.sessionStorage.setItem(MatTableHelperDirective.parentTableFocusIdentifier, this.config?.focusConfig?.sessionStorageIdentifier);
    }
  }

  private isBusinessTranslationsType(obj: any) {
    return obj.de || obj.fr || obj.it;
  }
}
