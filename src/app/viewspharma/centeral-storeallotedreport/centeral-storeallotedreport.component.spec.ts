import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenteralStoreallotedreportComponent } from './centeral-storeallotedreport.component';

describe('CenteralStoreallotedreportComponent', () => {
  let component: CenteralStoreallotedreportComponent;
  let fixture: ComponentFixture<CenteralStoreallotedreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CenteralStoreallotedreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CenteralStoreallotedreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
