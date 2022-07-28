/*
 * Copyright 2022 Software AG
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ 

import { NgModule } from '@angular/core';
import { ScreenComponent } from './screen/screen.component';
import { WebLoginComponent } from './webLogin/webLogin.component';
import { RouterModule, Routes } from '@angular/router';
import { RouteGuardService } from './services/route-guard.service';

export const generatedPages: any[] = [
];

const routes: Routes = [
  { path: 'webLogin', component: WebLoginComponent, canActivate: [RouteGuardService] },
  { path: 'instant', component: ScreenComponent, canActivate: [RouteGuardService] },
  { path: '**',   redirectTo: 'instant', pathMatch: 'full' }
]; 

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'}),
  ],
  exports: [RouterModule],
})

export class AppRoutingModule { }