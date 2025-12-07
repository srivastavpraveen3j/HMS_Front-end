import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-appointmentmanagement',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './appointmentmanagement.component.html',
  styleUrl: './appointmentmanagement.component.css'
})
export class AppointmentmanagementComponent {

  hospital = {
    name: 'PP Maniya Hospital',
    branches: [
      {
        name: 'PP Maniya Piplod',
        appointments: [
          { doctor: 'Dr. Rakesh Mehta', patient: 'Amit Patel', age: 45, disease: 'Diabetes', reason: 'Routine Checkup', startTime: '09:00', endTime: '09:15' },
          { doctor: 'Dr. Neha Shah', patient: 'Seema Thakkar', age: 34, disease: 'Thyroid', reason: 'Lab Review', startTime: '09:15', endTime: '09:30' },
          { doctor: 'Dr. Rakesh Mehta', patient: 'Mehul Joshi', age: 50, disease: 'Hypertension', reason: 'Follow-up', startTime: '09:30', endTime: '09:45' },
          { doctor: 'Dr. Neha Shah', patient: 'Jigna Rana', age: 29, disease: 'PCOD', reason: 'Consultation', startTime: '09:45', endTime: '10:00' },
          { doctor: 'Dr. Rakesh Mehta', patient: 'Ronak Shah', age: 36, disease: 'Fever', reason: 'Diagnosis', startTime: '10:00', endTime: '10:15' },
          { doctor: 'Dr. Neha Shah', patient: 'Krishna Mehta', age: 31, disease: 'Cold & Cough', reason: 'Checkup', startTime: '10:15', endTime: '10:30' },
          { doctor: 'Dr. Amit Patel', patient: 'Viral Desai', age: 27, disease: 'Asthma', reason: 'Review', startTime: '10:30', endTime: '10:45' },
          { doctor: 'Dr. Neha Shah', patient: 'Ankita Joshi', age: 33, disease: 'Skin Allergy', reason: 'Examination', startTime: '10:45', endTime: '11:00' },
          { doctor: 'Dr. Amit Patel', patient: 'Ravi Rana', age: 38, disease: 'Headache', reason: 'MRI Consultation', startTime: '11:00', endTime: '11:15' },
          { doctor: 'Dr. Neha Shah', patient: 'Priya Shah', age: 40, disease: 'Migraine', reason: 'Specialist Opinion', startTime: '11:15', endTime: '11:30' },
          { doctor: 'Dr. Rakesh Mehta', patient: 'Deepak Patel', age: 52, disease: 'Heart Issue', reason: 'Cardiology Referral', startTime: '11:30', endTime: '11:45' },
          { doctor: 'Dr. Amit Patel', patient: 'Snehal Desai', age: 35, disease: 'Back Pain', reason: 'Ortho Consultation', startTime: '11:45', endTime: '12:00' },
          { doctor: 'Dr. Neha Shah', patient: 'Payal Mehta', age: 28, disease: 'Acidity', reason: 'Treatment', startTime: '12:00', endTime: '12:15' },
          { doctor: 'Dr. Rakesh Mehta', patient: 'Bhavin Thakkar', age: 47, disease: 'Blood Pressure', reason: 'Regular Visit', startTime: '12:15', endTime: '12:30' },
          { doctor: 'Dr. Amit Patel', patient: 'Rekha Joshi', age: 41, disease: 'Joint Pain', reason: 'X-ray Review', startTime: '12:30', endTime: '12:45' },
          { doctor: 'Dr. Neha Shah', patient: 'Sagar Mehta', age: 32, disease: 'Diabetes', reason: 'Diet Plan', startTime: '12:45', endTime: '13:00' },
          { doctor: 'Dr. Rakesh Mehta', patient: 'Khushi Shah', age: 30, disease: 'Thyroid', reason: 'Follow-up', startTime: '13:00', endTime: '13:15' },
          { doctor: 'Dr. Neha Shah', patient: 'Gaurav Rana', age: 39, disease: 'Fever', reason: 'Urgent Care', startTime: '13:15', endTime: '13:30' },
          { doctor: 'Dr. Amit Patel', patient: 'Anil Desai', age: 46, disease: 'Chest Pain', reason: 'ECG', startTime: '13:30', endTime: '13:45' },
          { doctor: 'Dr. Neha Shah', patient: 'Nisha Thakkar', age: 37, disease: 'Skin Rash', reason: 'Review', startTime: '13:45', endTime: '14:00' }
        ]

      },
      {
        name: 'PP Maniya Adajan',
        appointments: [
          { doctor: 'Dr. Bhavesh Shah', patient: 'Tina Mehta', age: 29, disease: 'Cold', reason: 'Initial Diagnosis', startTime: '09:00', endTime: '09:15' },
          { doctor: 'Dr. Bhavesh Shah', patient: 'Rahul Joshi', age: 36, disease: 'Fever', reason: 'Urgent Checkup', startTime: '09:15', endTime: '09:30' },
          { doctor: 'Dr. Pooja Patel', patient: 'Sneha Desai', age: 31, disease: 'Thyroid', reason: 'Regular Checkup', startTime: '09:30', endTime: '09:45' },
          { doctor: 'Dr. Bhavesh Shah', patient: 'Nitin Rana', age: 44, disease: 'Back Pain', reason: 'Physio Advice', startTime: '09:45', endTime: '10:00' },
          { doctor: 'Dr. Pooja Patel', patient: 'Hetal Shah', age: 39, disease: 'Acidity', reason: 'Consultation', startTime: '10:00', endTime: '10:15' },
          { doctor: 'Dr. Bhavesh Shah', patient: 'Kiran Thakkar', age: 48, disease: 'High BP', reason: 'Medication Review', startTime: '10:15', endTime: '10:30' },
          { doctor: 'Dr. Pooja Patel', patient: 'Rupal Joshi', age: 42, disease: 'Migraine', reason: 'Revisit', startTime: '10:30', endTime: '10:45' },
          { doctor: 'Dr. Bhavesh Shah', patient: 'Chirag Mehta', age: 35, disease: 'Asthma', reason: 'Nebulization', startTime: '10:45', endTime: '11:00' },
          { doctor: 'Dr. Pooja Patel', patient: 'Manish Patel', age: 46, disease: 'Fatigue', reason: 'General Advice', startTime: '11:00', endTime: '11:15' },
          { doctor: 'Dr. Bhavesh Shah', patient: 'Minal Shah', age: 38, disease: 'Cough', reason: 'Prescribed Test', startTime: '11:15', endTime: '11:30' },
          { doctor: 'Dr. Pooja Patel', patient: 'Yash Desai', age: 30, disease: 'Depression', reason: 'Counseling', startTime: '11:30', endTime: '11:45' },
          { doctor: 'Dr. Bhavesh Shah', patient: 'Kinjal Patel', age: 33, disease: 'Ear Pain', reason: 'ENT Review', startTime: '11:45', endTime: '12:00' },
          { doctor: 'Dr. Pooja Patel', patient: 'Alok Rana', age: 40, disease: 'Cold', reason: 'Medicine Change', startTime: '12:00', endTime: '12:15' },
          { doctor: 'Dr. Bhavesh Shah', patient: 'Priya Mehta', age: 31, disease: 'Eye Strain', reason: 'Ophthalmology', startTime: '12:15', endTime: '12:30' },
          { doctor: 'Dr. Pooja Patel', patient: 'Mitesh Shah', age: 45, disease: 'Hypertension', reason: 'BP Monitoring', startTime: '12:30', endTime: '12:45' },
          { doctor: 'Dr. Bhavesh Shah', patient: 'Riya Desai', age: 28, disease: 'Cough', reason: 'X-ray', startTime: '12:45', endTime: '13:00' },
          { doctor: 'Dr. Pooja Patel', patient: 'Suresh Thakkar', age: 47, disease: 'Diabetes', reason: 'Sugar Monitoring', startTime: '13:00', endTime: '13:15' },
          { doctor: 'Dr. Bhavesh Shah', patient: 'Heena Joshi', age: 34, disease: 'Skin Allergy', reason: 'Dermatology', startTime: '13:15', endTime: '13:30' },
          { doctor: 'Dr. Pooja Patel', patient: 'Ajay Mehta', age: 49, disease: 'Thyroid', reason: 'Thyroid Panel', startTime: '13:30', endTime: '13:45' },
          { doctor: 'Dr. Bhavesh Shah', patient: 'Sheetal Rana', age: 27, disease: 'Ear Infection', reason: 'ENT', startTime: '13:45', endTime: '14:00' }
        ]

      },
      {
        name: 'PP Maniya City Varcha',
        appointments: [
          { doctor: 'Dr. Chirag Desai', patient: 'Raj Patel', age: 50, disease: 'Diabetes', reason: 'Blood Sugar Report', startTime: '09:00', endTime: '09:15' },
          { doctor: 'Dr. Chirag Desai', patient: 'Komal Shah', age: 33, disease: 'Thyroid', reason: 'Routine Visit', startTime: '09:15', endTime: '09:30' },
          { doctor: 'Dr. Harsh Mehta', patient: 'Dipen Joshi', age: 40, disease: 'Knee Pain', reason: 'X-ray Review', startTime: '09:30', endTime: '09:45' },
          { doctor: 'Dr. Chirag Desai', patient: 'Anjali Rana', age: 29, disease: 'Skin Infection', reason: 'Derm Consultation', startTime: '09:45', endTime: '10:00' },
          { doctor: 'Dr. Harsh Mehta', patient: 'Paresh Shah', age: 43, disease: 'Fever', reason: 'Follow-up', startTime: '10:00', endTime: '10:15' },
          { doctor: 'Dr. Chirag Desai', patient: 'Jinal Mehta', age: 36, disease: 'Migraine', reason: 'Neurology Referral', startTime: '10:15', endTime: '10:30' },
          { doctor: 'Dr. Harsh Mehta', patient: 'Bhakti Desai', age: 38, disease: 'Cough', reason: 'Chest X-ray', startTime: '10:30', endTime: '10:45' },
          { doctor: 'Dr. Chirag Desai', patient: 'Naresh Patel', age: 49, disease: 'Backache', reason: 'MRI Review', startTime: '10:45', endTime: '11:00' },
          { doctor: 'Dr. Harsh Mehta', patient: 'Kavita Joshi', age: 34, disease: 'Ear Pain', reason: 'ENT Exam', startTime: '11:00', endTime: '11:15' },
          { doctor: 'Dr. Chirag Desai', patient: 'Gopal Shah', age: 55, disease: 'High BP', reason: 'Follow-up', startTime: '11:15', endTime: '11:30' },
          { doctor: 'Dr. Harsh Mehta', patient: 'Vaishali Rana', age: 30, disease: 'Skin Allergy', reason: 'Consultation', startTime: '11:30', endTime: '11:45' },
          { doctor: 'Dr. Chirag Desai', patient: 'Jayesh Desai', age: 41, disease: 'Obesity', reason: 'Diet Plan', startTime: '11:45', endTime: '12:00' },
          { doctor: 'Dr. Harsh Mehta', patient: 'Neelam Thakkar', age: 32, disease: 'Fever', reason: 'Rapid Test', startTime: '12:00', endTime: '12:15' },
          { doctor: 'Dr. Chirag Desai', patient: 'Ramesh Patel', age: 52, disease: 'Diabetes', reason: 'Check Reports', startTime: '12:15', endTime: '12:30' },
          { doctor: 'Dr. Harsh Mehta', patient: 'Chitra Shah', age: 45, disease: 'Joint Pain', reason: 'Ortho Review', startTime: '12:30', endTime: '12:45' },
          { doctor: 'Dr. Chirag Desai', patient: 'Bhavesh Mehta', age: 46, disease: 'BP & Sugar', reason: 'Routine Check', startTime: '12:45', endTime: '13:00' },
          { doctor: 'Dr. Harsh Mehta', patient: 'Reena Desai', age: 35, disease: 'Cold & Flu', reason: 'General Check', startTime: '13:00', endTime: '13:15' },
          { doctor: 'Dr. Chirag Desai', patient: 'Sunil Joshi', age: 39, disease: 'Hair Fall', reason: 'Derm Advice', startTime: '13:15', endTime: '13:30' },
          { doctor: 'Dr. Harsh Mehta', patient: 'Nilesh Rana', age: 37, disease: 'Gastric Issues', reason: 'Consultation', startTime: '13:30', endTime: '13:45' },
          { doctor: 'Dr. Chirag Desai', patient: 'Alpesh Thakkar', age: 44, disease: 'Stress', reason: 'Psych Referral', startTime: '13:45', endTime: '14:00' }
        ]

      }
    ]
  };


}
