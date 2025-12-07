import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BranchService } from '../../../hospitaladminviews/hms/service/branch.service';
import { RoleService } from '../../../views/mastermodule/usermaster/service/role.service';

@Component({
  selector: 'app-addusersroles',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './addusersroles.component.html',
  styleUrls: ['./addusersroles.component.css']
})
export class AddusersrolesComponent {

  branchform: FormGroup;
  branch: any[] = [];

  constructor(private fb: FormBuilder, private branchService: BranchService, private router : Router, private userservice : RoleService ) {
    this.branchform = fb.group({
  name: ['', Validators.required],
  contact_email: ['', Validators.required],
  // role: ['', Validators.required], // Still stores just the string like "super_admin"
});

  }
  // roles : any[] = [];
// roles = [
//   { name: 'super_admin' },
//   { name: 'receptionist' },
//   { name: 'doctor' },
//   { name: 'lab_technician' }
// ];




  // ngOnInit(){

  //   this.userservice.getRoles().subscribe(res =>{
  //     console.log( "🚀 ~ UsermasterComponent ~ this.userservice.getusers ~ res:", res)
  //     this.roles = res;
  //   })
  // }

OnSubmit() {
  if (this.branchform.invalid) {
    console.log("🚀 ~ Form Invalid:", this.branchform.invalid);
    this.branchform.markAllAsTouched();
    return;
  }

  const apiKey = '50f1c7bce4a0b132df48d021d2001f8af8461cccdc96863b60030eac5871e962';

  // Get the form values
  const formValue = this.branchform.value;

  // Wrap role string into object
  const payload = {
    ...formValue,
    role: {
      name: formValue.role
    }
  };

  this.branchService.postBranch(payload, apiKey).subscribe({
    next: (res) => {
      alert("Branch Created Successfully");
      this.branch = res;
      this.router.navigateByUrl('/hospitaladmin/hospitalmanagement');
    },
    error: (err) => {
      console.log("🚀 ~ Error:", err);
    }
  });
}



}
