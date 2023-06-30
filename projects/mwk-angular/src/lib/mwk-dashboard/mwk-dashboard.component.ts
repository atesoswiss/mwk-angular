import { Component, Input } from '@angular/core';


@Component({
  selector: 'mwk-dashbaord',
  styleUrls: ['./mwk-dashboard.component.scss'],
  templateUrl: 'mwk-dashboard.component.html'
})
export class MwkDashboardComponent {

  @Input() pageTitle = "MWK page";

  constructor() {
  }

}
