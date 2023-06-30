import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MwkTableComponent } from './mwk-table.component';

describe('MwkAngularComponent', () => {
  let component: MwkTableComponent;
  let fixture: ComponentFixture<MwkTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MwkTableComponent]
    });
    fixture = TestBed.createComponent(MwkTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
