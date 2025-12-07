import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CustomcalendarComponent } from '../../../component/customcalendar/customcalendar.component';
import { CustomtimepickerComponent } from '../../../component/customtimepicker/customtimepicker.component';
import { CustomappointmenttimepickerComponent } from '../../../component/customappointmenttimepicker/customappointmenttimepicker.component';
import { BroadcastService } from '../service/broadcast.service';

@Component({
  selector: 'app-broadcastmessaging',
  imports: [RouterModule, CommonModule, ReactiveFormsModule],
  templateUrl: './broadcastmessaging.component.html',
  styleUrl: './broadcastmessaging.component.css'
})
export class BroadcastmessagingComponent {


  broadcastingform!: FormGroup;

  constructor(private fb: FormBuilder,   private broadcastService: BroadcastService,
    private router: Router) {
    this.broadcastingform = this.fb.group({
      title: ['', Validators.required],
      message: ['', [Validators.required, Validators.maxLength(500)]],
      scheduleDate: ['', Validators.required],
      scheduleTime: ['', Validators.required],
      targetAudience: ['all', Validators.required], // all, hospital, role
      hospitalId: [''], // Optional: visible only if hospital is selected
      type: ['info'] // info, alert, marketing
    });
  }



  onSubmit(): void {
    if (this.broadcastingform.invalid) {
      this.broadcastingform.markAllAsTouched();
      return;
    }

    // Store the form data using the service
    this.broadcastService.addBroadcastMessage(this.broadcastingform.value);

    // Navigate to the list page
    this.router.navigate(['/superadmin/braodcastingmessagelist']);
  }


}
