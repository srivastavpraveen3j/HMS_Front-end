import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-labmanagement',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './labmanagement.component.html',
  styleUrl: './labmanagement.component.css'
})
export class LabmanagementComponent {



  hospital = {
    name: 'PP Maniya Hospital',
    branches: [
      {
        name: 'PP Maniya Piplod',
        labTests: [
          { patient: 'Ramesh Patel', test: 'CBC', department: 'Pathology', referredBy: 'Dr. Hina Shah', technician: 'Lab Tech A' },
  { patient: 'Sejal Shah', test: 'MRI Brain', department: 'Radiology', referredBy: 'Dr. Arvind Desai', technician: 'Lab Tech B' },
  { patient: 'Manoj Thakkar', test: 'Liver Function Test', department: 'Pathology', referredBy: 'Dr. Sneha Mehta', technician: 'Lab Tech C' },
  { patient: 'Pooja Desai', test: 'CT Abdomen', department: 'Radiology', referredBy: 'Dr. Mahesh Thakkar', technician: 'Lab Tech A' },
  { patient: 'Rajesh Mehta', test: 'Biopsy', department: 'Cancer', referredBy: 'Dr. Kavita Joshi', technician: 'Lab Tech B' },
  { patient: 'Diksha Patel', test: 'Blood Glucose', department: 'Pathology', referredBy: 'Dr. Arvind Desai', technician: 'Lab Tech C' },
  { patient: 'Hiren Shah', test: 'X-ray Chest', department: 'Radiology', referredBy: 'Dr. Hina Shah', technician: 'Lab Tech A' },
  { patient: 'Nikita Joshi', test: 'Kidney Function Test', department: 'Pathology', referredBy: 'Dr. Sneha Mehta', technician: 'Lab Tech B' },
  { patient: 'Kamlesh Rana', test: 'PET Scan', department: 'Cancer', referredBy: 'Dr. Kavita Joshi', technician: 'Lab Tech C' },
  { patient: 'Kavita Gohil', test: 'Ultrasound Pelvis', department: 'Radiology', referredBy: 'Dr. Arvind Desai', technician: 'Lab Tech A' },
  { patient: 'Nilesh Trivedi', test: 'HbA1c', department: 'Pathology', referredBy: 'Dr. Mahesh Thakkar', technician: 'Lab Tech B' },
  { patient: 'Meena Desai', test: 'Mammography', department: 'Cancer', referredBy: 'Dr. Hina Shah', technician: 'Lab Tech C' },
  { patient: 'Vikram Shah', test: 'X-ray Spine', department: 'Radiology', referredBy: 'Dr. Arvind Desai', technician: 'Lab Tech A' },
  { patient: 'Rina Patel', test: 'D-Dimer', department: 'Pathology', referredBy: 'Dr. Sneha Mehta', technician: 'Lab Tech B' },
  { patient: 'Anil Thakkar', test: 'CT Thorax', department: 'Radiology', referredBy: 'Dr. Kavita Joshi', technician: 'Lab Tech C' },
  { patient: 'Bhavna Mehta', test: 'CA-125', department: 'Cancer', referredBy: 'Dr. Mahesh Thakkar', technician: 'Lab Tech A' },
  { patient: 'Jignesh Parmar', test: 'Serum Creatinine', department: 'Pathology', referredBy: 'Dr. Arvind Desai', technician: 'Lab Tech B' },
  { patient: 'Payal Shah', test: 'MRI Spine', department: 'Radiology', referredBy: 'Dr. Sneha Mehta', technician: 'Lab Tech C' },
  { patient: 'Rupesh Patel', test: 'Tumor Marker', department: 'Cancer', referredBy: 'Dr. Kavita Joshi', technician: 'Lab Tech A' },
  { patient: 'Sneha Joshi', test: 'Thyroid Profile', department: 'Pathology', referredBy: 'Dr. Mahesh Thakkar', technician: 'Lab Tech B' }
  ]
      },
      {
        name: 'PP Maniya Adajan',
        labTests:[
          { patient: 'Kajal Mehta', test: 'Chest X-ray', department: 'Radiology', referredBy: 'Dr. Rakesh Rana', technician: 'Lab Tech D' },
          { patient: 'Ravi Desai', test: 'PSA Test', department: 'Pathology', referredBy: 'Dr. Namita Shah', technician: 'Lab Tech E' },
          { patient: 'Nidhi Joshi', test: 'MRI Abdomen', department: 'Radiology', referredBy: 'Dr. Yash Thakkar', technician: 'Lab Tech F' },
          { patient: 'Vishal Thakkar', test: 'Urine Routine', department: 'Pathology', referredBy: 'Dr. Rakesh Rana', technician: 'Lab Tech D' },
          { patient: 'Hetal Shah', test: 'PET-CT Scan', department: 'Cancer', referredBy: 'Dr. Namita Shah', technician: 'Lab Tech E' },
          { patient: 'Raj Thakkar', test: 'Bilirubin', department: 'Pathology', referredBy: 'Dr. Yash Thakkar', technician: 'Lab Tech F' },
          { patient: 'Rupal Mehta', test: 'MRI Knee', department: 'Radiology', referredBy: 'Dr. Rakesh Rana', technician: 'Lab Tech D' },
          { patient: 'Jatin Patel', test: 'ESR', department: 'Pathology', referredBy: 'Dr. Namita Shah', technician: 'Lab Tech E' },
          { patient: 'Sonal Joshi', test: 'Sputum Test', department: 'Cancer', referredBy: 'Dr. Yash Thakkar', technician: 'Lab Tech F' },
          { patient: 'Mitesh Gohil', test: 'CT Spine', department: 'Radiology', referredBy: 'Dr. Rakesh Rana', technician: 'Lab Tech D' },
          { patient: 'Krupa Shah', test: 'CRP', department: 'Pathology', referredBy: 'Dr. Namita Shah', technician: 'Lab Tech E' },
          { patient: 'Paresh Rana', test: 'USG Abdomen', department: 'Radiology', referredBy: 'Dr. Yash Thakkar', technician: 'Lab Tech F' },
          { patient: 'Neha Patel', test: 'Tumor Marker - AFP', department: 'Cancer', referredBy: 'Dr. Rakesh Rana', technician: 'Lab Tech D' },
          { patient: 'Chirag Shah', test: 'Lipid Profile', department: 'Pathology', referredBy: 'Dr. Namita Shah', technician: 'Lab Tech E' },
          { patient: 'Minal Mehta', test: 'X-ray Leg', department: 'Radiology', referredBy: 'Dr. Yash Thakkar', technician: 'Lab Tech F' },
          { patient: 'Suresh Desai', test: 'Pap Smear', department: 'Cancer', referredBy: 'Dr. Rakesh Rana', technician: 'Lab Tech D' },
          { patient: 'Heena Thakkar', test: 'Vitamin D', department: 'Pathology', referredBy: 'Dr. Namita Shah', technician: 'Lab Tech E' },
          { patient: 'Alok Rana', test: 'MRI Brain', department: 'Radiology', referredBy: 'Dr. Yash Thakkar', technician: 'Lab Tech F' },
          { patient: 'Kinjal Joshi', test: 'Thyroid Antibodies', department: 'Cancer', referredBy: 'Dr. Rakesh Rana', technician: 'Lab Tech D' },
          { patient: 'Yash Patel', test: 'HIV Test', department: 'Pathology', referredBy: 'Dr. Namita Shah', technician: 'Lab Tech E' }
        ]

      },
      {
        name: 'PP Maniya City Varcha',
        labTests: [
          { patient: 'Ankit Rana', test: 'Blood Culture', department: 'Pathology', referredBy: 'Dr. Harsh Mehta', technician: 'Lab Tech G' },
          { patient: 'Priya Pandey', test: 'CT Brain', department: 'Radiology', referredBy: 'Dr. Rupal Shah', technician: 'Lab Tech H' },
          { patient: 'Mahesh Bhatt', test: 'Gene Panel', department: 'Cancer', referredBy: 'Dr. Pooja Patel', technician: 'Lab Tech I' },
          { patient: 'Bhumi Mehta', test: 'Hemoglobin', department: 'Pathology', referredBy: 'Dr. Harsh Mehta', technician: 'Lab Tech G' },
          { patient: 'Kishan Patel', test: 'X-ray Arm', department: 'Radiology', referredBy: 'Dr. Rupal Shah', technician: 'Lab Tech H' },
          { patient: 'Ritika Shah', test: 'Tumor DNA', department: 'Cancer', referredBy: 'Dr. Pooja Patel', technician: 'Lab Tech I' },
          { patient: 'Deepak Joshi', test: 'Serum Iron', department: 'Pathology', referredBy: 'Dr. Harsh Mehta', technician: 'Lab Tech G' },
          { patient: 'Sneha Rana', test: 'Ultrasound Breast', department: 'Radiology', referredBy: 'Dr. Rupal Shah', technician: 'Lab Tech H' },
          { patient: 'Rahul Desai', test: 'Bone Marrow', department: 'Cancer', referredBy: 'Dr. Pooja Patel', technician: 'Lab Tech I' },
          { patient: 'Asmita Shah', test: 'Platelet Count', department: 'Pathology', referredBy: 'Dr. Harsh Mehta', technician: 'Lab Tech G' },
          { patient: 'Parth Mehta', test: 'MRI Pelvis', department: 'Radiology', referredBy: 'Dr. Rupal Shah', technician: 'Lab Tech H' },
          { patient: 'Nisha Patel', test: 'HER2/neu', department: 'Cancer', referredBy: 'Dr. Pooja Patel', technician: 'Lab Tech I' },
          { patient: 'Tarun Thakkar', test: 'Calcium', department: 'Pathology', referredBy: 'Dr. Harsh Mehta', technician: 'Lab Tech G' },
          { patient: 'Payal Gohil', test: 'X-ray Hip', department: 'Radiology', referredBy: 'Dr. Rupal Shah', technician: 'Lab Tech H' },
          { patient: 'Dharmesh Shah', test: 'Tumor Marker - CA 19-9', department: 'Cancer', referredBy: 'Dr. Pooja Patel', technician: 'Lab Tech I' },
          { patient: 'Nirali Joshi', test: 'LDH', department: 'Pathology', referredBy: 'Dr. Harsh Mehta', technician: 'Lab Tech G' },
          { patient: 'Bhavesh Desai', test: 'X-ray Abdomen', department: 'Radiology', referredBy: 'Dr. Rupal Shah', technician: 'Lab Tech H' },
          { patient: 'Khyati Mehta', test: 'Cancer Mutation Panel', department: 'Cancer', referredBy: 'Dr. Pooja Patel', technician: 'Lab Tech I' },
          { patient: 'Rakesh Patel', test: 'Folic Acid', department: 'Pathology', referredBy: 'Dr. Harsh Mehta', technician: 'Lab Tech G' },
          { patient: 'Sheetal Rana', test: 'MRI Cervical', department: 'Radiology', referredBy: 'Dr. Rupal Shah', technician: 'Lab Tech H' }
        ]

      }
    ]
  };


}
