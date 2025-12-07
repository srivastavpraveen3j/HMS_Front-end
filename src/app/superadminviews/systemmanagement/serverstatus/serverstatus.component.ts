import { Component } from '@angular/core';

@Component({
  selector: 'app-serverstatus',
  imports: [],
  templateUrl: './serverstatus.component.html',
  styleUrl: './serverstatus.component.css'
})
export class ServerstatusComponent {


  refreshInterval: any;
  selectedRefresh = '30 seconds';

  ngOnInit(): void {
    this.setRefresh(this.selectedRefresh);
  }

  setRefresh(option: string) {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    switch (option) {
      case '30 seconds':
        this.refreshInterval = setInterval(() => this.refreshData(), 30000);
        break;
      case '1 minute':
        this.refreshInterval = setInterval(() => this.refreshData(), 60000);
        break;
      case '5 minutes':
        this.refreshInterval = setInterval(() => this.refreshData(), 300000);
        break;
      case '15 minutes':
        this.refreshInterval = setInterval(() => this.refreshData(), 900000);
        break;
      case 'Manual':
        // Do nothing
        break;
    }
  }

  onRefreshChange(event: any) {
    this.setRefresh(event.target.value);
  }

  refreshData() {
    // TODO: Add real data fetching logic
    console.log("Refreshing data...");
  }

  manualRefresh() {
    this.refreshData();
  }

  viewHistory() {
    // TODO: Open modal or navigate to historical data view
    console.log("Viewing history...");
  }

}
