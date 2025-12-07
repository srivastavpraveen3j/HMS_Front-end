import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThreadNoteComponent } from '../../component/thread-note/thread-note.component';
import { SuperadminService } from '../superadminservice/superadmin.service';

@Component({
  selector: 'app-suepradmindashboard',
  standalone: true,
  imports: [RouterModule, CommonModule, ThreadNoteComponent],
  templateUrl: './suepradmindashboard.component.html',
  styleUrls: ['./suepradmindashboard.component.css']
})
export class SuepradmindashboardComponent {
  hospitalDataArray : any[] = [];

  constructor(private superadminService: SuperadminService){}

  ngOnInit(): void{
    this.loadNamespaceData();
  }

  loadNamespaceData() {
    this.superadminService.getNamespaces().subscribe((res) => {
      this.hospitalDataArray = (res && typeof res === 'object' && 'data' in res) ? (res as any).data : res;
      console.log("Namespace", this.hospitalDataArray);
    });
  }

  toggleExpand(hospital: any) {
    hospital.expanded = !hospital.expanded;
  }
}
