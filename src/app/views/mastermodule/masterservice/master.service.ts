import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../../enviornment/env';

@Injectable({
  providedIn: 'root',
})
export class MasterService {
  // doctor master servcies starts here
  private apiUrl = `${environment.baseurl}/doctorMaster`;
  // private bulkuploadUrl = `${environment.baseurl}/doctor/import`;

  constructor(private http: HttpClient) { }

  uploadDoctorsCSV(fileData: FormData) {
    return this.http.post(`${environment.baseurl}/doctor/import`, fileData);
  }

  getDoctorMasterList(search?: string): Observable<any> {
    let url = `${environment.baseurl}/`;
    if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    } 1
    return this.http.get(url);
  }

  // get doctor
  // getDoctors(
  //   page: number = 1,
  //   limit: number = 50,
  //   search: string = ''
  // ): Observable<any> {
  //   let params = new HttpParams()
  //     .set('page', page.toString())
  //     .set('limit', limit.toString());

  //   if (search.trim()) {
  //     params = params.set('search', search);
  //   }

  //   return this.http.get<any>(this.apiUrl, { params });
  // }
  getDoctors(
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  getDoctor(page: number, limit: number, name: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (name.trim()) {
      params = params.set('name', name.trim());
    }

    return this.http.get<any>(`${this.apiUrl}`, { params });
  }

  getDoctorsByName(name: string): Observable<any> {
    const params = new HttpParams().set('name', name.trim());
    return this.http.get<any>(this.apiUrl, { params });
  }

  // add doctor
  postDoctor(doctorData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, doctorData);
  }

  // delete doctor

  deleteDoctor(doctorid: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${doctorid}`);
  }

  // udpate doctor

  updateDoctor(doctorid: any, doctorData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${doctorid}`, doctorData);
  }

  // getdocotorbyid
  getDoctorById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // bulk upload in doctor

  // master medicine starts here

  private masterMedicineUrl = `${environment.baseurl}/medicine`;
  private transferRequestUrl = `${environment.baseurl}/transfer-requests`;
  private pharmacyUrl = `${environment.baseurl}/pharmacies`;
  private cetralstoreUrl = `${environment.baseurl}/centralstore`;

  // Existing methods...

  // New transfer request methods
  // masterservice/master.service.ts - Add these methods
  createSubPharmacyWithStock(pharmacyData: any): Observable<any> {
    return this.http.post(
      `${this.pharmacyUrl}/sub-pharmacies-with-stock`,
      pharmacyData
    );
  }

  getSubPharmacyStock(pharmacyId: string): Observable<any> {
    return this.http.get(
      `${this.pharmacyUrl}/sub-pharmacies/${pharmacyId}/stock`
    );
  }
  getSubPharmacyExpiredStock(pharmacyId: string): Observable<any> {
    return this.http.get(
      `${this.pharmacyUrl}/sub-pharmacies/${pharmacyId}/expired`
    );
  }

  // Add to your existing MasterService
  checkCentralInventoryAvailability(medicineIds: string[]): Observable<any> {
    return this.http.post(
      `${this.pharmacyUrl}/central-inventory/check-availability`,
      {
        medicine_ids: medicineIds,
      }
    );
  }

  getCentralInventory(page = 1, limit = 50, search = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('search', search);

    return this.http.get(`${this.pharmacyUrl}/central-inventory`, { params });
  }

  transferFromCentralStore(
    pharmacyId: string,
    medicines: any[]
  ): Observable<any> {
    return this.http.post(
      `${this.pharmacyUrl}/sub-pharmacies/${pharmacyId}/transfer-from-central`,
      { medicines }
    );
  }

  // createTransferRequest(requestData: any): Observable<any> {
  //   return this.http.post(`${this.transferRequestUrl}`, requestData);
  // }
  // ✅ Keep this method - it has the right parameter order
  getTransferRequests(
    page: number = 1,
    limit: number = 10,
    filters: any = {}
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params = params.set(key, filters[key]);
      }
    });

    console.log('Getting transfer requests with params:', params.toString());
    return this.http.get(`${this.transferRequestUrl}`, { params });
  }

  // ✅ Main approval method - this triggers inventory update
  approveTransferRequest(
    requestId: string,
    approvalData: any
  ): Observable<any> {
    console.log('🚀 Approving transfer request:', requestId, approvalData);
    return this.http.put(
      `${this.transferRequestUrl}/${requestId}/approve`,
      approvalData
    );
  }

  // ✅ Create transfer request method
  createTransferRequest(requestData: any): Observable<any> {
    console.log('Service: Creating transfer request', requestData);
    return this.http.post(`${this.transferRequestUrl}`, requestData);
  }

  completeTransferRequest(requestId: string) {
    return this.http.post(
      `${this.transferRequestUrl}/${requestId}/complete`,
      {}
    );
  }

  // masterservice/master.service.ts - Add debug method
  debugTransferRequest(requestId: string): Observable<any> {
    return this.http.get(`${this.transferRequestUrl}/${requestId}/debug`);
  }

  // *** NEW: Dedicated location update ***
  updateMedicineLocation(itemId: string, location: string): Observable<any> {
    const updateData = { location_in_pharmacy: location };
    console.log('📍 Updating medicine location:', itemId, location);
    return this.http.put(
      `${this.pharmacyUrl}/inventory-items/${itemId}/location`,
      updateData
    );
  }

  // *** NEW: Stock-only update ***
  updateInventoryStock(
    itemId: string,
    adjustment: number,
    reason: string
  ): Observable<any> {
    const updateData = {
      adjustment,
      reason,
      update_type: 'stock',
    };
    console.log('📦 Updating inventory stock:', itemId, adjustment);
    return this.http.put(
      `${this.pharmacyUrl}/inventory-items/${itemId}/stock`,
      updateData
    );
  }

  // *** NEW: Comprehensive inventory update ***
  updateInventoryItemDetails(itemId: string, updateData: any): Observable<any> {
    console.log('🔄 Comprehensive inventory update:', itemId, updateData);
    return this.http.put(
      `${this.pharmacyUrl}/inventory-items/${itemId}`,
      updateData
    );
  }

  // *** NEW: Get inventory item by ID ***
  getInventoryItemById(itemId: string): Observable<any> {
    return this.http.get(`${this.pharmacyUrl}/inventory-items/${itemId}`);
  }
  // asterservice/master.service.ts - Add these methods

  // Get all sub-pharmacies
  getSubPharmacies(): Observable<any> {
    return this.http.get(`${this.pharmacyUrl}/sub-pharmacies`);
  }
  getCentralStore(): Observable<any> {
    return this.http.get(`${this.cetralstoreUrl}`);
  }

  // Create new sub-pharmacy
  createSubPharmacy(pharmacyData: any): Observable<any> {
    return this.http.post(`${this.pharmacyUrl}/sub-pharmacies`, pharmacyData);
  }

  // Update sub-pharmacy
  updateSubPharmacy(id: string, pharmacyData: any): Observable<any> {
    return this.http.put(
      `${this.pharmacyUrl}/sub-pharmacies/${id}`,
      pharmacyData
    );
  }

  // Delete sub-pharmacy
  deleteSubPharmacy(id: string): Observable<any> {
    return this.http.delete(`${this.pharmacyUrl}/sub-pharmacies/${id}`);
  }

  // Get pharmacy by ID
  getSubPharmacyById(id: string): Observable<any> {
    return this.http.get(`${this.pharmacyUrl}/sub-pharmacies/${id}`);
  }

  // masterservice/master.service.ts - Add these methods

  // Get all inventory items of a specific sub-pharmacy
  getSubPharmacyInventoryItems(
    pharmacyId: string,
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get(
      `${this.pharmacyUrl}/sub-pharmacies/${pharmacyId}/inventory`,
      { params }
    );
  }
  getSubPharmacyInventoryItem(
    pharmacyId: string,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams();

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get(
      `${this.pharmacyUrl}/sub-pharmacies/${pharmacyId}/inventory`,
      { params }
    );
  }

  // In your MasterService
  // getSubPharmacyInventoryItems(pharmacyId: string, page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
  //   const params = new HttpParams()
  //     .set('page', page.toString())
  //     .set('limit', limit.toString())
  //     .set('search', search);

  //   return this.http.get(`${this.pharmacyUrl}/sub-pharmacies/${pharmacyId}/inventory`, { params });
  // }

  // masterservice/master.service.ts

  // Get specific inventory item details
  getInventoryItemDetails(itemId: string): Observable<any> {
    return this.http.get(`${this.pharmacyUrl}/inventory-items/${itemId}`);
  }

  // Update specific inventory item stock
  // master.service.ts
  updateInventoryItem(itemId: string, updateData: any): Observable<any> {
    return this.http.put(
      `${this.pharmacyUrl}/inventory-items/${itemId}/stock`,
      updateData
    );
  }

  // get medicine
  // getMedicine(): Observable<any> {
  //   return this.http.get<any>(this.masterMedicineUrl);
  // }

  getMedicine(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.masterMedicineUrl, { params });
  }

  // services/master.service.ts
  searchMedicines(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<any>(`${this.masterMedicineUrl}/search`, { params });
  }

  getmedicine(
    page: number,
    limit: number,
    medicine_name: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (medicine_name.trim()) {
      params = params.set('medicine_name', medicine_name.trim());
    }

    return this.http.get<any>(`${this.masterMedicineUrl}`, { params });
  }
  // getlowstockmedicine(
  //   page: number,
  //   limit: number,
  //   medicine_name: string = ''
  // ): Observable<any> {
  //   let params = new HttpParams()
  //     .set('page', page.toString())
  //     .set('limit', limit.toString());

  //   if (medicine_name.trim()) {
  //     params = params.set('medicine_name', medicine_name.trim());
  //   }

  //   return this.http.get<any>(`${this.masterMedicineUrl}`, { params });
  // }

  getexpiredmedicine(medicine_name: string = ''): Observable<any> {
    let params = new HttpParams();
    // .set('page', page.toString())
    // .set('limit', limit.toString());

    if (medicine_name.trim()) {
      params = params.set('medicine_name', medicine_name.trim());
    }

    return this.http.get<any>(`${this.masterMedicineUrl}/stock/expired`, {
      params,
    });
  }

  getAllMedicine() {
    return this.http.get<any>(`${this.masterMedicineUrl}`);
  }

  // getlowstock

  getlowstockmedicine(medicine_name: string = ''): Observable<any> {
    let params = new HttpParams();
    // .set('page', page.toString())
    // .set('limit', limit.toString());

    if (medicine_name.trim()) {
      params = params.set('medicine_name', medicine_name.trim());
    }
    return this.http.get<any>(`${this.masterMedicineUrl}/stock/low`, {
      params,
    });
  }

  disposeMedicines(medicineIds: string[]): Observable<any> {
    return this.http.post(`${this.masterMedicineUrl}/dispose`, { medicineIds });
  }
  // service
  subpharmacydisposeMedicines(payload: {
    inventoryIds: string[];
  }): Observable<any> {
    return this.http.post(
      `${this.masterMedicineUrl}/subpharmacydispose`,
      payload
    );
  }

  //     disposeMedicines(batches: any[]): Observable<any> {
  //   return this.http.post(`${this.masterMedicineUrl}/dispose`, {
  //     batches: batches
  //   });
  // }

  getDisposedMedicines(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('search', search);

    return this.http.get(`${this.masterMedicineUrl}/disposed`, { params });
  }

  // bulkupload

  uploadMedicineCSV(fileData: FormData) {
    return this.http.post(`${this.masterMedicineUrl}/import`, fileData);
  }

  getMedicinenyname(filters: any = {}) {
    return this.http.get(this.masterMedicineUrl, { params: filters });
  }

  getMedicineById(id: string): Observable<any> {
    return this.http.get<any>(`${this.masterMedicineUrl}/${id}`);
  }

  // add medicine
  postMedicine(medicineData: any): Observable<any> {
    return this.http.post<any>(this.masterMedicineUrl, medicineData);
  }

  // udpate medicine

  updateMedicine(medicineid: any, medicineData: any): Observable<any> {
    return this.http.put<any>(
      `${this.masterMedicineUrl}/${medicineid}`,
      medicineData
    );
  }

  // delete medicine

  deleteMedicine(medicineid: any): Observable<any> {
    return this.http.delete<any>(`${this.masterMedicineUrl}/${medicineid}`);
  }

  // Symptoms master starts here

  private SymptomsUrl = `${environment.baseurl}/symptoms`;

  // get Symptoms

  //  getSymptoms(page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
  //   let params = new HttpParams()
  //     .set('page', page)
  //     .set('limit', limit);

  //     if (search.trim()) {
  //       params = params.set('search', search);
  //     }

  //   return this.http.get<any>(this.SymptomsUrl, { params });
  // }

  getSymptoms(
    page: number = 1,
    limit: number = 10,
    name: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (name.trim()) {
      params = params.set('name', name); // 👈 use name, not search
    }

    return this.http.get<any>(this.SymptomsUrl, { params });
  }

  uploadSymptomsCSV(fileData: FormData) {
    return this.http.post(`${this.SymptomsUrl}/import`, fileData);
  }

  getAllSymptoms(): Observable<any> {
    return this.http.get<any>(this.SymptomsUrl);
  }

  getSymptom(page: number, limit: number, name: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (name.trim()) {
      params = params.set('name', name.trim());
    }

    return this.http.get<any>(`${this.SymptomsUrl}`, { params });
  }

  // add medicine
  postSymptoms(SymptomsData: any): Observable<any> {
    return this.http.post<any>(this.SymptomsUrl, SymptomsData);
  }

  // udpate medicine

  updateSymptoms(Symptomsid: any, SymptomsData: any): Observable<any> {
    return this.http.put<any>(
      `${this.SymptomsUrl}/${Symptomsid}`,
      SymptomsData
    );
  }

  // delete Symptoms

  deleteSymptoms(Symptomsid: any): Observable<any> {
    return this.http.delete<any>(`${this.SymptomsUrl}/${Symptomsid}`);
  }

  // SymptomsGroup master starts here

  private SymptomsGroupUrl = `${environment.baseurl}/symptomGroup`;

  // get SymptomsGroup

  getSymptomsGroup(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams().set('page', page).set('limit', limit);

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.SymptomsGroupUrl, { params });
  }
  getSymptomGrp(): Observable<any> {
    return this.http.get<any>(this.SymptomsGroupUrl);
  }

  getAllSymptomsGroup(): Observable<any> {
    return this.http.get<any>(this.SymptomsGroupUrl);
  }

  getSymptomGroup(
    page: number,
    limit: number,
    symptomGroups: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (symptomGroups.trim()) {
      params = params.set('symptomGroups', symptomGroups.trim());
    }

    return this.http.get<any>(`${this.SymptomsGroupUrl}`, { params });
  }

  // add symptmsgroup
  postSymptomsGroup(SymptomsGroupData: any): Observable<any> {
    return this.http.post<any>(this.SymptomsGroupUrl, SymptomsGroupData);
  }

  // udpate symptmsgroup

  updateSymptomsGroup(
    SymptomsGroupDataid: any,
    SymptomsGroupData: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.SymptomsGroupUrl}/${SymptomsGroupDataid}`,
      SymptomsGroupData
    );
  }

  // delete symptmsgroup

  deleteSymptomsGroup(SymptomsGroupDataid: any): Observable<any> {
    return this.http.delete<any>(
      `${this.SymptomsGroupUrl}/${SymptomsGroupDataid}`
    );
  }

  // services starts here

  private ServicesUrl = `${environment.baseurl}/service`;

  getServices(
    page: number = 1,
    limit: number = 15,
    name: string = '',
    type: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (name.trim()) {
      params = params.set('name', name.trim());
    }

    if (type.trim()) {
      params = params.set('type', type.trim()); // Ensure you include this in backend
    }

    return this.http.get<any>(`${this.ServicesUrl}`, { params });
  }
  getServics(
    page: number = 1,
    limit: number = 2000,
    name: string = '',
    type: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (name.trim()) {
      params = params.set('name', name.trim());
    }

    if (type.trim()) {
      params = params.set('type', type.trim()); // Ensure you include this in backend
    }

    return this.http.get<any>(`${this.ServicesUrl}`, { params });
  }


  // for search
  getService(page: number, limit: number, name: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (name.trim()) {
      params = params.set('name', name.trim());
    }

    return this.http.get<any>(`${this.ServicesUrl}`, { params });
  }

  // masterservice/master.service.ts
  getServicess(
    page: number,
    limit: number,
    name: string = '',
    type: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (name.trim()) {
      params = params.set('name', name.trim());
    }

    if (type.trim()) {
      params = params.set('type', type.trim());
    }

    return this.http.get<any>(`${this.ServicesUrl}`, { params });
  }

  getServiceById(serviceId: string): Observable<any> {
    return this.http.get<any>(`${this.ServicesUrl}/${serviceId}`);
  }

  getAllservice() {
    return this.http.get<any>(`${this.ServicesUrl}`);
  }

  uploadServciesCSV(fileData: FormData) {
    return this.http.post(`${this.ServicesUrl}/import`, fileData);
  }

  // add medicine
  postService(ServiceUrlData: any): Observable<any> {
    return this.http.post<any>(this.ServicesUrl, ServiceUrlData);
  }

  deleteService(Serviceid: any): Observable<any> {
    return this.http.delete<any>(`${this.ServicesUrl}/${Serviceid}`);
  }

  updateService(Serviceid: any, ServiceUrlData: any): Observable<any> {
    return this.http.put<any>(
      `${this.ServicesUrl}/${Serviceid}`,
      ServiceUrlData
    );
  }

  // servciegroupstrats here

  private ServiceGroupUrl = `${environment.baseurl}/serviceGroup`;
  // get servcuirgroup

  getServiceGroup(
    page: number = 1,
    limit: number = 10,
    group_name: string = '',
    type: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (group_name.trim()) {
      params = params.set('group_name', group_name.trim());
    }

    if (type.trim()) {
      params = params.set('type', type.trim()); // Ensure you include this in backend
    }

    return this.http.get<any>(this.ServiceGroupUrl, { params });
  }

  // for search
  getServicegroup(
    page: number,
    limit: number,
    group_name: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (group_name.trim()) {
      params = params.set('group_name', group_name.trim());
    }

    return this.http.get<any>(`${this.ServiceGroupUrl}`, { params });
  }

  // add medicine
  postServiceGroup(ServiceGroupUrlData: any): Observable<any> {
    return this.http.post<any>(this.ServiceGroupUrl, ServiceGroupUrlData);
  }

  deleteServiceGroup(ServiceGroupid: any): Observable<any> {
    return this.http.delete<any>(`${this.ServiceGroupUrl}/${ServiceGroupid}`);
  }

  updateServiceGroup(
    ServiceGroupid: any,
    ServiceGroupUrlData: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.ServiceGroupUrl}/${ServiceGroupid}`,
      ServiceGroupUrlData
    );
  }

  // medical test starts here

  private MedicaltestUrl = `${environment.baseurl}/testParameter`;
  // get servcuirgroup

  // getMedicaltest(): Observable<any> {
  //   return this.http.get<any>(this.MedicaltestUrl);
  // }

  getMedicaltest(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.MedicaltestUrl, { params });
  }
  getmedicaltest(
    page: number,
    limit: number,
    test_name: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (test_name.trim()) {
      params = params.set('test_name', test_name.trim());
    }

    return this.http.get<any>(`${this.MedicaltestUrl}`, { params });
  }

  getMedicaltestById(medicaltest: string): Observable<any> {
    return this.http.get<any>(`${this.MedicaltestUrl}/${medicaltest}`);
  }

  // In master.service.ts
  searchTestParameters(payload: {
    search: string;
    page: number;
    limit: number;
  }) {
    return this.http.post<any>(
      `${this.MedicaltestUrl}/testparameter/search`,
      payload
    );
  }

  // add medicine
  postMedicaltest(MedicaltestUrlUrlData: any): Observable<any> {
    return this.http.post<any>(this.MedicaltestUrl, MedicaltestUrlUrlData);
  }

  deleteMedicaltest(MedicaltestUrlUrlDataid: any): Observable<any> {
    return this.http.delete<any>(
      `${this.MedicaltestUrl}/${MedicaltestUrlUrlDataid}`
    );
  }

  updateMedicaltest(
    MedicaltestUrlUrlDataid: any,
    MedicaltestUrlUrlData: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.MedicaltestUrl}/${MedicaltestUrlUrlDataid}`,
      MedicaltestUrlUrlData
    );
  }

  // medicaltest group  starts here

  private MedicaltestGroup = `${environment.baseurl}/testGroup`;
  // get servcuirgroup

  // getMedicaltest(): Observable<any> {
  //   return this.http.get<any>(this.MedicaltestUrl);
  // }

  getMedicaltestGroup(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.MedicaltestGroup, { params });
  }

  // for search

  getmedicaltestGroup(
    page: number,
    limit: number,
    testGroup: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (testGroup.trim()) {
      params = params.set('testGroup', testGroup.trim());
    }

    return this.http.get<any>(`${this.MedicaltestGroup}`, { params });
  }

  // add medicine
  postMedicaltestGroup(MedicaltestUrlUrlData: any): Observable<any> {
    return this.http.post<any>(this.MedicaltestGroup, MedicaltestUrlUrlData);
  }

  getMedeicalTestgroupById(medicaltestgroupid: string): Observable<any> {
    return this.http.get<any>(`${this.MedicaltestGroup}/${medicaltestgroupid}`);
  }

  deleteMedicaltestGroup(MedicaltestUrlUrlDataid: any): Observable<any> {
    return this.http.delete<any>(
      `${this.MedicaltestGroup}/${MedicaltestUrlUrlDataid}`
    );
  }

  updateMedicaltestGroup(
    MedicaltestUrlUrlDataid: any,
    MedicaltestUrlUrlData: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.MedicaltestGroup}/${MedicaltestUrlUrlDataid}`,
      MedicaltestUrlUrlData
    );
  }

  // ward master starts here

  private WardmasterUrl = `${environment.baseurl}/wardMaster`;

  getWardmasterUrl(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.WardmasterUrl, { params });
  }

  getwardmasterUrl(
    page: number,
    limit: number,
    ward_name: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (ward_name.trim()) {
      params = params.set('ward_name', ward_name.trim());
    }

    return this.http.get<any>(`${this.WardmasterUrl}`, { params });
  }

  postWardmasterUrl(WardmasterUrlData: any): Observable<any> {
    return this.http.post<any>(this.WardmasterUrl, WardmasterUrlData);
  }

  deleteWardmasterUrl(WardmasterUrlid: any): Observable<any> {
    return this.http.delete<any>(`${this.WardmasterUrl}/${WardmasterUrlid}`);
  }

  updateWardmasterUrl(
    WardmasterUrlid: any,
    WardmasterUrlData: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.WardmasterUrl}/${WardmasterUrlid}`,
      WardmasterUrlData
    );
  }

  // packages starts here

  private Packages = `${environment.baseurl}/packages`;

  getPackages(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.Packages, { params });
  }
  // getPackages(): Observable<any> {

  //   return this.http.get<any>(this.Packages);
  // }

  // for search
  getPackage(
    page: number,
    limit: number,
    packagename: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (packagename.trim()) {
      params = params.set('packagename', packagename.trim());
    }

    return this.http.get<any>(`${this.Packages}`, { params });
  }

  postPackages(PackagesData: any): Observable<any> {
    return this.http.post<any>(this.Packages, PackagesData);
  }

  deletePackages(Packagesid: any): Observable<any> {
    return this.http.delete<any>(`${this.Packages}/${Packagesid}`);
  }

  updatePackages(Packagesid: any, PackagesData: any): Observable<any> {
    return this.http.put<any>(`${this.Packages}/${Packagesid}`, PackagesData);
  }

  // Referral rule starts here

  private referralRule = `${environment.baseurl}/referralRule`;

  getReferralRules(
    page: number,
    limit: number,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('department', search.trim());
    }

    return this.http.get<any>(`${this.referralRule}`, { params });
  }

  postReferralRule(referralData: any): Observable<any> {
    return this.http.post<any>(this.referralRule, referralData);
  }

  updateReferralRule(ruleId: any, updateData: any): Observable<any> {
    return this.http.put<any>(`${this.referralRule}/${ruleId}`, updateData);
  }

  deleteReferralRule(referralId: any): Observable<any> {
    return this.http.delete<any>(`${this.referralRule}/${referralId}`);
  }

  uploadReferralRule(fileData: FormData) {
    return this.http.post(`${this.referralRule}/import`, fileData);
  }

  // medicine stocks starts here

  private Medicinestock = `${environment.baseurl}/medicinestock`;

  getMedicinestock(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.Medicinestock, { params });
  }

  // add medicine
  postMedicinestock(PackagesData: any): Observable<any> {
    return this.http.post<any>(this.Medicinestock, PackagesData);
  }

  deleteMedicinestock(Packagesid: any): Observable<any> {
    return this.http.delete<any>(`${this.Medicinestock}/${Packagesid}`);
  }

  updateMedicinestock(Packagesid: any, PackagesData: any): Observable<any> {
    return this.http.put<any>(
      `${this.Medicinestock}/${Packagesid}`,
      PackagesData
    );
  }

  // surgery master starts here

  private surgerymaster = `${environment.baseurl}/surgeryService`;

  getsurgerymaster(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.surgerymaster, { params });
  }

  getsurgerymasterById(id: string): Observable<any> {
    const params = new HttpParams().set('_id', id);
    return this.http.get<any>(`${this.surgerymaster}`, { params });
  }

  // for search
  // getSurgerymaster(
  //   page: number,
  //   limit: number,
  //   name: string = ''
  // ): Observable<any> {
  //   let params = new HttpParams()
  //     .set('page', page.toString())
  //     .set('limit', limit.toString());

  //   if (name.trim()) {
  //     params = params.set('name', name.trim());
  //   }

  //   return this.http.get<any>(`${this.surgerymaster}`, { params });
  // }

  getSurgerymaster(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Observable<any> {
    // Return empty results immediately if search is too short (but not empty)
    if (search.trim().length > 0 && search.trim().length < 3) {
      return of({
        total: 0,
        page: 1,
        totalPages: 0,
        limit: limit,
        services: [],
        message: "Search term must be at least 3 characters"
      });
    }

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    // Only add search param if it's empty or has 3+ characters
    if (search.trim().length >= 3) {
      params = params.set('search', search.trim());
    }

    return this.http.get<any>(this.surgerymaster, { params });
  }


  // bulkupload

  uploadSurgeryCSV(fileData: FormData) {
    return this.http.post(`${this.surgerymaster}/import`, fileData);
  }

  // add medicine
  postsurgerymaster(surgerymasterData: any): Observable<any> {
    return this.http.post<any>(this.surgerymaster, surgerymasterData);
  }

  deletesurgerymaster(surgerymasterid: any): Observable<any> {
    return this.http.delete<any>(`${this.surgerymaster}/${surgerymasterid}`);
  }

  updatesurgerymaster(
    surgerymasterid: any,
    surgerymasterData: any
  ): Observable<any> {
    return this.http.put<any>(
      `${this.surgerymaster}/${surgerymasterid}`,
      surgerymasterData
    );
  }
}
