import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-doctormanagement',
  imports: [CommonModule, RouterModule],
  templateUrl: './doctormanagement.component.html',
  styleUrl: './doctormanagement.component.css'
})
export class DoctormanagementComponent {

  hospital = {
    name: 'PP Maniya Hospital',
    branches: [
      {
        name: 'PP Maniya Piplod',
        doctors: [
          {
            name: 'Dr. Rohan Mehta',
            email: 'rohan.mehta@example.com',
            department: 'Cardiology',
            speciality: 'Interventional Cardiology',
            field: 'Heart Diseases',
            status: 'Available',
            image: 'https://randomuser.me/api/portraits/men/81.jpg'
          },
          {
            name: 'Dr. Priya Sharma',
            email: 'priya.sharma@example.com',
            department: 'Gynecology',
            speciality: 'Obstetrics',
            field: 'Women’s Health',
            status: 'Not Available',
            image: 'https://randomuser.me/api/portraits/women/83.jpg'
          },
          {
            name: 'Dr. Aman Kapoor',
            email: 'aman.kapoor@example.com',
            department: 'Neurology',
            speciality: 'Neurosurgery',
            field: 'Brain Disorders',
            status: 'Available',
            image: 'https://randomuser.me/api/portraits/men/91.jpg'
          },
          {
            name: 'Dr. Neha Joshi',
            email: 'neha.joshi@example.com',
            department: 'Dermatology',
            speciality: 'Cosmetic Dermatology',
            field: 'Skin & Hair',
            status: 'Available',
            image: 'https://randomuser.me/api/portraits/women/90.jpg'
          },
          {
            name: 'Dr. Arjun Patel',
            email: 'arjun.patel@example.com',
            department: 'Orthopedics',
            speciality: 'Joint Replacement',
            field: 'Bones & Joints',
            status: 'Not Available',
            image: 'https://randomuser.me/api/portraits/men/85.jpg'
          },
          {
            name: 'Dr. Sneha Iyer',
            email: 'sneha.iyer@example.com',
            department: 'Oncology',
            speciality: 'Radiation Oncology',
            field: 'Cancer Treatment',
            status: 'Available',
            image: 'https://randomuser.me/api/portraits/women/88.jpg'
          },
          {
            name: 'Dr. Rajat Singh',
            email: 'rajat.singh@example.com',
            department: 'ENT',
            speciality: 'Otolaryngology',
            field: 'Ear, Nose, Throat',
            status: 'Available',
            image: 'https://randomuser.me/api/portraits/men/89.jpg'
          },
          {
            name: 'Dr. Kavita Nair',
            email: 'kavita.nair@example.com',
            department: 'Pediatrics',
            speciality: 'Neonatology',
            field: 'Child Health',
            status: 'Not Available',
            image: 'https://randomuser.me/api/portraits/women/86.jpg'
          },
        ]
      },
      {
        name: 'PP Maniya Adajan',
        doctors: [
          {
            name: 'Dr. Anuj Saxena',
            email: 'anuj.saxena@example.com',
            department: 'Pulmonology',
            speciality: 'Critical Care',
            field: 'Lung Disorders',
            status: 'Available',
            image: 'https://randomuser.me/api/portraits/men/92.jpg'
          },
          {
            name: 'Dr. Pooja Sinha',
            email: 'pooja.sinha@example.com',
            department: 'Nephrology',
            speciality: 'Dialysis',
            field: 'Kidney Care',
            status: 'Available',
            image: 'https://randomuser.me/api/portraits/women/93.jpg'
          },
          {
            name: 'Dr. Dev Desai',
            email: 'dev.desai@example.com',
            department: 'General Surgery',
            speciality: 'Laparoscopy',
            field: 'Minimally Invasive Surgery',
            status: 'Available',
            image: 'https://randomuser.me/api/portraits/men/94.jpg'
          },
          {
            name: 'Dr. Meenal Trivedi',
            email: 'meenal.trivedi@example.com',
            department: 'Ophthalmology',
            speciality: 'Cataract Surgery',
            field: 'Vision Care',
            status: 'Not Available',
            image: 'https://randomuser.me/api/portraits/women/95.jpg'
          },
          {
            name: 'Dr. Nikhil Reddy',
            email: 'nikhil.reddy@example.com',
            department: 'Psychiatry',
            speciality: 'Clinical Psychiatry',
            field: 'Mental Health',
            status: 'Available',
            image: 'https://randomuser.me/api/portraits/men/96.jpg'
          },
          {
            name: 'Dr. Ananya Pillai',
            email: 'ananya.pillai@example.com',
            department: 'Pathology',
            speciality: 'Histopathology',
            field: 'Lab Diagnosis',
            status: 'Available',
            image: 'https://randomuser.me/api/portraits/women/97.jpg'
          },
          {
            name: 'Dr. Mohit Bhatt',
            email: 'mohit.bhatt@example.com',
            department: 'Radiology',
            speciality: 'CT & MRI',
            field: 'Imaging',
            status: 'Not Available',
            image: 'https://randomuser.me/api/portraits/men/98.jpg'
          },
          {
            name: 'Dr. Sanya Verma',
            email: 'sanya.verma@example.com',
            department: 'Dentistry',
            speciality: 'Orthodontics',
            field: 'Dental Braces',
            status: 'Available',
            image: 'https://randomuser.me/api/portraits/women/99.jpg'
          }
        ]
      },
      {
        name: 'PP Maniya Varacha',
        doctors: [
          {
            name: 'Dr. Rohan Mehta',
            email: 'rohan.mehta@example.com',
            department: 'Cardiology',
            speciality: 'Interventional Cardiology',
            field: 'Heart Diseases',
            status: 'Available',
            image: 'https://randomuser.me/api/portraits/men/81.jpg'
          },
          {
            name: 'Dr. Priya Sharma',
            email: 'priya.sharma@example.com',
            department: 'Gynecology',
            speciality: 'Obstetrics',
            field: 'Women’s Health',
            status: 'Not Available',
            image: 'https://randomuser.me/api/portraits/women/83.jpg'
          },
          {
            name: 'Dr. Aman Kapoor',
            email: 'aman.kapoor@example.com',
            department: 'Neurology',
            speciality: 'Neurosurgery',
            field: 'Brain Disorders',
            status: 'Available',
            image: 'https://randomuser.me/api/portraits/men/91.jpg'
          },
          {
            name: 'Dr. Neha Joshi',
            email: 'neha.joshi@example.com',
            department: 'Dermatology',
            speciality: 'Cosmetic Dermatology',
            field: 'Skin & Hair',
            status: 'Available',
            image: 'https://randomuser.me/api/portraits/women/90.jpg'
          },
          {
            name: 'Dr. Arjun Patel',
            email: 'arjun.patel@example.com',
            department: 'Orthopedics',
            speciality: 'Joint Replacement',
            field: 'Bones & Joints',
            status: 'Not Available',
            image: 'https://randomuser.me/api/portraits/men/85.jpg'
          },
          {
            name: 'Dr. Sneha Iyer',
            email: 'sneha.iyer@example.com',
            department: 'Oncology',
            speciality: 'Radiation Oncology',
            field: 'Cancer Treatment',
            status: 'Available',
            image: 'https://randomuser.me/api/portraits/women/88.jpg'
          },
          {
            name: 'Dr. Rajat Singh',
            email: 'rajat.singh@example.com',
            department: 'ENT',
            speciality: 'Otolaryngology',
            field: 'Ear, Nose, Throat',
            status: 'Available',
            image: 'https://randomuser.me/api/portraits/men/89.jpg'
          },
          {
            name: 'Dr. Kavita Nair',
            email: 'kavita.nair@example.com',
            department: 'Pediatrics',
            speciality: 'Neonatology',
            field: 'Child Health',
            status: 'Not Available',
            image: 'https://randomuser.me/api/portraits/women/86.jpg'
          },
        ]
      }
    ]
  };


  }

