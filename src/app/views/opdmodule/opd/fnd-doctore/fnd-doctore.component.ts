import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'https://api.example.com/doctors'; // Replace with your API endpoint

  constructor(private http: HttpClient) {}

  searchDoctors(query: string): Observable<any[]> {
    if (!query.trim()) {
      return new Observable((observer) => observer.next([])); // Return empty array if no query
    }
    return this.http.get<any[]>(`${this.apiUrl}?search=${query}`);
  }
}
