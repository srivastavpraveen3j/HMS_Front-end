import { Component, OnInit, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PolicymasterService } from '../../../core/services/policymaster-service.service';
import { DiscountService } from '../../../core/services/discount.service';
import { FormGroup } from '@angular/forms';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-policy-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './policy-details.component.html',
  styleUrls: ['./policy-details.component.css']
})
export class PolicyDetailsComponent implements OnInit {
  @Input() parentForm!: FormGroup; // parent discount form
  @Output() policy = new EventEmitter<string>();

  policies: any[] = [];
  filteredPolicies: any[] = [];
  searchTerm: string = '';

  constructor(private policyService: PolicymasterService) { }

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies() {
    this.policyService.getPolicies().subscribe((res: any) => {
      this.policies = res.data || res;
      this.filteredPolicies = this.policies;
    });
  }

  selectPolicy(policy: string) {
    this.policy.emit(policy);
  }

  searchPolicies() {
    if (!this.searchTerm.trim()) {
      this.filteredPolicies = this.policies;
      return;
    }
    this.filteredPolicies = this.policies.filter((p) =>
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      p.policyType.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
