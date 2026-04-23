import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbonoFormComponent } from './abono-form.component';

describe('AbonoFormComponent', () => {
  let component: AbonoFormComponent;
  let fixture: ComponentFixture<AbonoFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AbonoFormComponent]
    });
    fixture = TestBed.createComponent(AbonoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
