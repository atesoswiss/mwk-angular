import { Component, OnInit } from '@angular/core';
import { MatTableConfig, TableEditableInputPropagationMode } from '../../projects/mwk-angular/src/lib/mwk-table/core/mat-table.config';
import sampleData from './sample-data.json'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'mwk-frontend';

  data: any;
  config: any;

  constructor() {}

  ngOnInit(): void {
    this.data = sampleData;

    this.config = new MatTableConfig({
      columns: [
        'index', 'guid', 'isActive', 'balance', 'picture'
      ],
      selectable: true,
      focusConfig: {
        sessionStorageIdentifier: 'bla',
        conditionKey: 'AuftragId',
        nbrOfSubRows: 1
      },
      storageConfig: {
        identifier: `pruefplan-editor-overview`,
        storeFilters: true,
        storeSorting: true
      },
      editableConfig: {
        rowIdentifier: '_id',
        columns: [],
        inputPropagationMode: TableEditableInputPropagationMode.MANUAL_PER_ENTRY
      }
    })
  }
}
