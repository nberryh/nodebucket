/**
 * Title: security-routing.module.ts
 * Author: Nolan Berryhill
 * Date: 1/21/2024
 */

// imports statements
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecurityComponent } from './security.component';
import { SigninComponent } from './signin/signin.component';
import { FourzerofourComponent } from '../fourzerofour/fourzerofour.component';

// Creates route for nav bar
const routes: Routes = [
  {
    path: '',
    component: SecurityComponent,
    children: [
      {
        path: 'signin',
        component: SigninComponent,
        title: 'Nodebucket: Sign In'
      },
      {
        path: '**',
        component: FourzerofourComponent,
        title: 'Not Found'
      }
    ]
  }
];

// @NgModule is given imports and exports
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

// exports SecurityRoutingModule
export class SecurityRoutingModule { }
