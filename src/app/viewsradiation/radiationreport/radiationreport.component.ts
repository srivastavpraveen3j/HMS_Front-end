import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TestService } from '../../viewspatho/testservice/test.service';

@Component({
  selector: 'app-radiationreport',
  imports: [RouterModule, CommonModule],
  templateUrl: './radiationreport.component.html',
  styleUrl: './radiationreport.component.css'
})
export class RadiationreportComponent {


  reports: { title: string; icon: string }[] = [];
  patho: any[] = [];

  constructor(private masterService: TestService, private router: Router) {}

  ngOnInit(): void {
    this.loadPathologyTestGroupsFromPatients();
  }

  loadPathologyTestGroupsFromPatients(): void {
    this.masterService.getTestreq().subscribe({
      next: (res: any[]) => {
        // ✅ Only pathology requests
        this.patho = res.filter(item => item.requestedDepartment === 'radiation');

        const groupSet = new Set<string>();

        // ✅ Collect all unique testGroup names
        this.patho.forEach(entry => {
          (entry.testMaster || []).forEach((test: any) => {
            if (test.testGroup) {
              groupSet.add(test.testGroup);
            }
          });
        });

        this.reports = Array.from(groupSet).map(groupName => ({
          title: groupName,
          icon: this.assignDynamicIcon(groupName)
        }));
      },
      error: (err) => {
        console.error('❌ Error loading patient test requests:', err);
      }
    });
  }

  // Assign icon based on group name
  assignDynamicIcon(groupName: string): string {
    const name = groupName.toLowerCase();

    if (name.includes('cbc') || name.includes('hematology')) return 'fa-solid fa-vial';
    if (name.includes('bio')) return 'fa-solid fa-flask';
    if (name.includes('urine')) return 'fa-solid fa-prescription-bottle';
    if (name.includes('stool')) return 'fa-solid fa-toilet';
    if (name.includes('hormone') || name.includes('hormonal')) return 'fa-solid fa-dna';
    if (name.includes('tumor') || name.includes('marker')) return 'fa-solid fa-ribbon';
    if (name.includes('infect')) return 'fa-solid fa-virus';
    if (name.includes('cyto') || name.includes('histo')) return 'fa-solid fa-microscope';
    if (name.includes('coagul')) return 'fa-solid fa-syringe';

    return 'fa-solid fa-notes-medical'; // default fallback
  }


}
