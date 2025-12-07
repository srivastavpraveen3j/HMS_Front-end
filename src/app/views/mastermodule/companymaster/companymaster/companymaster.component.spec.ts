import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanymasterComponent } from './companymaster.component';

describe('CompanymasterComponent', () => {
  let component: CompanymasterComponent;
  let fixture: ComponentFixture<CompanymasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanymasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanymasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
