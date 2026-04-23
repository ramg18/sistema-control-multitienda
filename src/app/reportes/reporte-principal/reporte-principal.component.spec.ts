import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportePrincipalComponent } from './reporte-principal.component';

describe('ReportePrincipalComponent', () => {
  let component: ReportePrincipalComponent;
  let fixture: ComponentFixture<ReportePrincipalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportePrincipalComponent]
    });
    fixture = TestBed.createComponent(ReportePrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
