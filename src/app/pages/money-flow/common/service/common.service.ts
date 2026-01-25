import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(
    public formBuilder: UntypedFormBuilder,
    public http: HttpClient,
    public route: ActivatedRoute
  ) { }

  // Common API Methods ==========================================================================

  // Common Post
  getData(API: any): Observable<any> {
    return this.http.get<any>(API);
  }

  // Common Post
  postData(API: any, obj: any): Observable<any> {
    return this.http.post<any>(API, obj);
  }

  // ============================================================================================

  // Get Formated Date
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  // Get User Data
  GetUserData() {
    const user = sessionStorage.getItem('user');
    if (user) return JSON.parse(user);

    return {};
  }
}
