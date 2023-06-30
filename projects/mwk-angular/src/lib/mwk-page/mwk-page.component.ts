import { Component, Input } from '@angular/core';


@Component({
  selector: 'mwk-page',
  styleUrls: ['./mwk-page.component.scss'],
  templateUrl: 'mwk-page.component.html'
})
export class MwkPageComponent {

  @Input() pageTitle = "MWK page";

  constructor() {
  }

}
