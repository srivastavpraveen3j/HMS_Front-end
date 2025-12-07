import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathoreportdepartmentwiseopdreportipdreportComponent } from './pathoreportdepartmentwiseopdreportipdreport.component';

describe('PathoreportdepartmentwiseopdreportipdreportComponent', () => {
  let component: PathoreportdepartmentwiseopdreportipdreportComponent;
  let fixture: ComponentFixture<PathoreportdepartmentwiseopdreportipdreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PathoreportdepartmentwiseopdreportipdreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PathoreportdepartmentwiseopdreportipdreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
