import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { UnidadEmail } from "../models/UnidadEmail";

@Injectable({
  providedIn: 'root',
})
export class UnidadEmailService {
  constructor(private http: HttpClient) {}

  addEmail(unidadId: number, email: string): Observable<UnidadEmail> {
    return this.http.post<UnidadEmail>(`${environment.apiUrl}/api/unidad-emails/${unidadId}`, { email });
  }

deleteEmail(emailId: number): Observable<any> {
  return this.http.delete(`${environment.apiUrl}/api/unidad-emails/${emailId}`, { responseType: 'text' });
}

  
getEmailsByUnidadId(unidadId: number) {
  return this.http.get<UnidadEmail[]>(`${environment.apiUrl}/api/unidad-emails/${unidadId}`);
}




}
