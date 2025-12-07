import { MasterService } from './../../masterservice/master.service';
import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CustomcalendarComponent } from '../../../../component/customcalendar/customcalendar.component';
import { CustomtimepickerComponent } from '../../../../component/customtimepicker/customtimepicker.component';
import { RoleService } from '../service/role.service';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
// import Swal from 'sweetalert2';

@Component({
  selector: 'app-usermaster',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './usermaster.component.html',
  styleUrl: './usermaster.component.css',
})
export class UsermasterComponent {

  userform: FormGroup;
  roleSearch: string = '';
  dropdownOpen: boolean = false;
  editMode = false;
  userId: string | null = null;
  userPermissions: any = {};
  selectedRole: any = null;
  roles: any[] = [];
  doctor: any[] = [];
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown-wrapper')) {
      this.dropdownOpen = false;
    }
  }
  private masterService = inject(MasterService);

  constructor(
    private fb: FormBuilder,
    private userservice: RoleService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userform = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      // age: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      role: ['', Validators.required],
      // details: this.fb.group({
      //   department: [''],
      //   experience: [''],
      //   shift: [''],
      //   employeeCode: [''],
      //   certification: [''],
      //   licenseNo: [''],
      //   registrationNo: [''],
      //   specialization: [''],
      //   equipmentHandled: this.fb.array([]),
      //   labSections: this.fb.array([]),
      //   supportLevel: [''],
      //   assignedSystems: this.fb.array([]),
      //   cashHandling: [false],
      //   billingSoftware: [''],
      //   assignedWards: this.fb.array([]),
      //   emergencyContactName: [''],
      //   emergencyContactPhone: [''],
      //   addressLine1: [''],
      //   addressLine2: [''],
      //   city: [''],
      //   state: [''],
      //   postalCode: [''],
      //   dateOfJoining: [''],
      //   status: ['active']
      // })
    });
  }

  // roles = [
  //   { _id: '60f8f1b5a2c2b9a1e8e4f001', name: 'Admin' },
  //   { _id: '60f8f1b5a2c2b9a1e8e4f002', name: 'Doctor' },
  //   { _id: '60f8f1b5a2c2b9a1e8e4f003', name: 'Nurse' },
  //   { _id: '60f8f1b5a2c2b9a1e8e4f004', name: 'Receptionist' },
  //   { _id: '60f8f1b5a2c2b9a1e8e4f005', name: 'Lab Technician' }
  // ];

  ngOnInit(): void {
    // load permissions
    const allPermissions = JSON.parse(
      localStorage.getItem('permissions') || '[]'
    );
    const uhidModule = allPermissions.find(
      (perm: any) => perm.moduleName === 'user'
    );
    this.userPermissions = uhidModule?.permissions || {};

    // load permissions

    this.userservice.getRoles().subscribe((res) => {
      console.log(
        '🚀 ~ UsermasterComponent ~ this.userservice.getusers ~ res:',
        res
      );
      this.roles = res;
    });

    this.route.queryParams.subscribe((params) => {
      this.userId = params['_id'] || null;
      this.editMode = !!this.userId;
      if (this.editMode && this.userId) {
        this.loaduser(this.userId);
      }
    });
  }

  filteredRoles() {
    const search = (this.roleSearch || '').toLowerCase();
    return this.roles.filter((role) =>
      role.name.toLowerCase().includes(search)
    );
  }

  onRoleSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.roleSearch = input.value;
    this.dropdownOpen = true;
  }

  searchDoctorControl = new FormControl('');
  doctorList: any[] = [];
  showDoctorDropdown = false;

  onSelectDoctor(doc: any) {
    // Set the name input to selected doctor
    this.userform.patchValue({ name: doc.name });

    // Set search input to selected doctor (optional)
    this.searchDoctorControl.setValue(doc.name);  

    // Hide dropdown list
    this.doctorList = [];
  }


  selectRole(role: any) {
    this.selectedRole = role;
    this.roleSearch = role.name;

    if (role?.name?.toLowerCase().includes('doctor')) {
      this.showDoctorDropdown = true;

      // initial load without search
      this.loadDoctors('');

      // listen to search input for dynamic suggestions
      this.searchDoctorControl.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe((value: string | null) => {
          this.loadDoctors(value || '');
        });
    } else {
      this.showDoctorDropdown = false;
    }

    this.dropdownOpen = false;
    this.userform.patchValue({ role: role._id });
  }

  loadDoctors(search: string) {
    this.masterService.getDoctors(search).subscribe((res: any) => {
      this.doctorList = res.data;
    });
  }

  loaduser(userId: string) {
    this.userservice.getusers().subscribe((res: any) => {
      const users = res || [];
      const user = users.find((u: any) => u._id === userId);
      console.log('🚀 ~ Loaded user:', user);

      if (user) {
        this.userform.patchValue({
          name: user.name,
          email: user.email,
          age: user.age,
          role: user.role?._id,
        });

        if (user.role) {
          this.selectedRole = user.role;
          this.roleSearch = user.role.name;
        }
      }
    });
  }

  async OnSubmit() {
    const Swal = (await import('sweetalert2')).default;

    // this.userform.value
    if (this.userform.invalid) {
      console.log(
        '🚀 ~ UsermasterComponent ~ OnSubmit ~ this.userform.invalid:',
        this.userform.invalid
      );
    }

    if (this.userId) {
      // Update OPD case
      this.userservice.updateUser(this.userId, this.userform.value).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'User  Updated',
            text: 'User has been updated successfully.',
            position: 'top-end',
            toast: true,
            timer: 3000,
            showConfirmButton: false,
            customClass: {
              popup: 'hospital-toast-popup',
              title: 'hospital-toast-title',
              htmlContainer: 'hospital-toast-text',
            },
          });
          this.router.navigateByUrl('/master/usermasterlist');
        },
        error: (err) => {
          console.error('Error updating Roles:', err);
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text:
              err?.error?.message ||
              'Something went wrong while updating the User.',
            customClass: {
              popup: 'hospital-swal-popup',
              title: 'hospital-swal-title',
              htmlContainer: 'hospital-swal-text',
              confirmButton: 'hospital-swal-button',
            },
          });
        },
      });
    } else {
      // console.log("🚀 ~ UsermasterComponent ~ OnSubmit ~ this.userform.value:", this.userform.value)

      this.userservice.postUser(this.userform.value).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'User Created',
            text: 'New User has been generated and saved.',
            position: 'top-end',
            toast: true,
            timer: 3500,
            showConfirmButton: false,
            customClass: {
              popup: 'hospital-toast-popup',
              title: 'hospital-toast-title',
              htmlContainer: 'hospital-toast-text',
            },
          });

          this.router.navigate(['/master/usermasterlist']);
        },
        error: (err) => {
          console.error('Error creating User:', err);
          Swal.fire({
            icon: 'error',
            title: 'Creation Failed',
            position: 'top-end',
            toast: true,
            timer: 3500,
            text:
              err?.error?.message ||
              'An error occurred while creating the User.',
            customClass: {
              popup: 'hospital-swal-popup',
              title: 'hospital-swal-title',
              htmlContainer: 'hospital-swal-text',
              confirmButton: 'hospital-swal-button',
            },
          });
        },
      });
    }
  }
}
