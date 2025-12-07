// // helpers/opd-helpers.ts
// import { firstValueFrom } from 'rxjs';
// import { OpdService } from '../views/opdmodule/opdservice/opd.service';
// /**
//  * Fetch UHID from OPD Bill ID
//  * @param opdService - instance of OpdService
//  * @param billId - OPD Bill ID
//  * @returns Promise<string> - resolves to UHID string
//  */
// export async function getUHIDFromBillId(opdService: OpdService, billId: string): Promise<string | null> {
//   try {
//     // Convert Observable to Promise for easier async/await usage
//     const res = await firstValueFrom(opdService.getUHIDFromBillId(billId));
//     return res?.uhid || null;
//   } catch (err) {
//     console.error('Error fetching UHID:', err);
//     return null;
//   }
// }
