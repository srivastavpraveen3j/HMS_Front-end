import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackupmanagementComponent } from './backupmanagement.component';

describe('BackupmanagementComponent', () => {
  let component: BackupmanagementComponent;
  let fixture: ComponentFixture<BackupmanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackupmanagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackupmanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
