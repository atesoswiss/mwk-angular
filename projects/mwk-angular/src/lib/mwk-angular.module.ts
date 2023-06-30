import { NgModule } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { MwkDialog } from './mwk-dialog/base/mwk-dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MwkTableComponent } from './mwk-table/mwk-table.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MwkPageComponent } from './mwk-page/mwk-page.component';
import { MatCardModule } from '@angular/material/card';
import { MwkDashboardComponent } from './mwk-dashboard/mwk-dashboard.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MwkHeaderComponent } from './mwk-header/mwk-header.component';

@NgModule({
  declarations: [
    MwkTableComponent,
    MwkDialog,
    MwkPageComponent,
    MwkDashboardComponent,
    MwkHeaderComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    TranslateModule,
    MatTableModule,
    MatSortModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatCardModule,
    MatSidenavModule
  ],
  exports: [
    MwkTableComponent,
    MwkDialog,
    MwkPageComponent,
    MwkDashboardComponent,
    MwkHeaderComponent
  ]
})
export class MwkAngularModule {}
