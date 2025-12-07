import { Component } from '@angular/core';
interface Version {
  version: string;
  releaseDate: string;
  type: 'Stable' | 'Beta' | 'Alpha' | 'Hotfix';
  status: 'Active' | 'Deprecated' | 'Archived';
  deployedCount: number;
  totalHospitals: number;
  deploymentPercentage: number;
}

interface Hospital {
  name: string;
  currentVersion: string;
  targetVersion: string;
  status: 'Ready' | 'In Progress' | 'Failed' | 'Complete';
}

interface Activity {
  time: string;
  detail: string;
  isHighPriority?: boolean;
}
@Component({
  selector: 'app-versioncontrol',
  imports: [],
  templateUrl: './versioncontrol.component.html',
  styleUrl: './versioncontrol.component.css'
})
export class VersioncontrolComponent {

  currentStableVersion: string = 'v4.2.7';
  currentBetaVersion: string = 'v4.3.0';
  totalDeployments: number = 142;
  updateSuccessRate: number = 97;

  // Filter and search
  versionFilter: string = 'All Versions';
  timeFilter: string = 'Past 30 Days';
  searchQuery: string = '';

  // Version list
  versions: Version[] = [
    {
      version: 'v4.2.7',
      releaseDate: '15 Apr 2025',
      type: 'Stable',
      status: 'Active',
      deployedCount: 228,
      totalHospitals: 240,
      deploymentPercentage: 95
    },
    {
      version: 'v4.3.0',
      releaseDate: '10 Apr 2025',
      type: 'Beta',
      status: 'Active',
      deployedCount: 30,
      totalHospitals: 240,
      deploymentPercentage: 12
    },
    {
      version: 'v4.2.6',
      releaseDate: '23 Mar 2025',
      type: 'Stable',
      status: 'Deprecated',
      deployedCount: 12,
      totalHospitals: 240,
      deploymentPercentage: 5
    },
    {
      version: 'v4.2.5',
      releaseDate: '15 Feb 2025',
      type: 'Stable',
      status: 'Archived',
      deployedCount: 0,
      totalHospitals: 240,
      deploymentPercentage: 0
    },
    {
      version: 'v4.2.4-hotfix',
      releaseDate: '03 Feb 2025',
      type: 'Hotfix',
      status: 'Archived',
      deployedCount: 0,
      totalHospitals: 240,
      deploymentPercentage: 0
    }
  ];

  // Deployment options
  selectedVersionForDeployment: string = 'v4.2.7 (Stable)';
  deploymentTarget: string = 'All Hospitals';
  deploymentSchedule: string = 'Immediate';

  // Stats
  hospitalsOnLatestVersion: number = 228;
  pendingUpdates: number = 12;
  failedUpdates: number = 3;
  averageUpdateTime: string = '8 min';

  // Recent activities
  recentActivities: Activity[] = [
    { time: '10:30 AM', detail: '<strong>MGM Hospital</strong> updated to <strong>v4.2.7</strong>' },
    { time: '9:45 AM', detail: '<strong>City Medical Center</strong> update failed', isHighPriority: true },
    { time: '9:15 AM', detail: '<strong>v4.3.0</strong> deployed to <strong>Mayo Clinic</strong>' },
    { time: 'Yesterday', detail: '<strong>v4.2.7</strong> marked as stable release' },
    { time: 'Yesterday', detail: '<strong>Johns Hopkins</strong> updated to <strong>v4.2.7</strong>' }
  ];

  // Ready for deployment hospitals
  readyHospitals: Hospital[] = [
    { name: 'Apollo Hospitals', currentVersion: 'v4.2.6', targetVersion: 'v4.2.7', status: 'Ready' },
    { name: 'Cleveland Clinic', currentVersion: 'v4.2.6', targetVersion: 'v4.2.7', status: 'Ready' },
    { name: 'Mount Sinai Hospital', currentVersion: 'v4.2.6', targetVersion: 'v4.2.7', status: 'Ready' }
  ];

  constructor() { }

  ngOnInit(): void {
    // Initialize component
  }

  // Methods for version management
  createNewRelease(): void {
    console.log('Creating new release');
    // Logic to create new release
  }

  openVersionSettings(): void {
    console.log('Opening version settings');
    // Logic to open settings modal
  }

  filterVersions(): void {
    console.log(`Filtering versions by: ${this.versionFilter}, Time: ${this.timeFilter}`);
    // Logic to filter versions based on criteria
  }

  searchVersions(): void {
    console.log(`Searching for: ${this.searchQuery}`);
    // Logic to search versions
  }

  viewVersionDetails(version: string): void {
    console.log(`Viewing details for version: ${version}`);
    // Logic to view version details
  }

  viewReleaseNotes(version: string): void {
    console.log(`Viewing release notes for version: ${version}`);
    // Logic to view release notes
  }

}
