import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuepradmindashboardComponent } from './suepradmindashboard.component';

describe('SuepradmindashboardComponent', () => {
  let component: SuepradmindashboardComponent;
  let fixture: ComponentFixture<SuepradmindashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuepradmindashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuepradmindashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
