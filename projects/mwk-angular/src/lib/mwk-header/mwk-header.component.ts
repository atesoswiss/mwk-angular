import { Component, Input } from '@angular/core';


@Component({
  selector: 'mwk-header',
  styleUrls: ['./mwk-header.component.scss'],
  templateUrl: 'mwk-header.component.html'
})
export class MwkHeaderComponent {

  @Input() pageTitle = "MWK page";

  constructor() {
  }

}
