import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateslistComponent } from './certificateslist.component';

describe('CertificateslistComponent', () => {
  let component: CertificateslistComponent;
  let fixture: ComponentFixture<CertificateslistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CertificateslistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CertificateslistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
