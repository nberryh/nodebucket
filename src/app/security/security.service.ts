/**
 * Title: security.service.ts
 * Author: Nolan Berryhill
 * Date: 1/21/2024
 */

// imports statements
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// @Injectable is given providedIn
@Injectable({
  providedIn: 'root'
})

// exports SecurityService
export class SecurityService {

  constructor(private http: HttpClient) { }

  findEmployeeById(empId: number) {
    return this.http.get('/api/employees/' + empId);
  }
}
