import {
  NgModule
} from '@angular/core';
import {
  Routes,
  RouterModule
} from '@angular/router';
import {
  BodyComponent
} from './components/body/body.component';
import {
  CheckordersComponent
} from './components/checkout/checkorders/checkorders.component';
import {
  ProductDetailsComponent
} from './components/product-details/product-details.component';

const routes: Routes = [{
    path: '',
    component: BodyComponent,
    pathMatch: 'full'
  },
  {
    path: 'checkout/checkorders',
    component: CheckordersComponent
  },
  {
    path: 'product-details/:id',
    component: ProductDetailsComponent
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'signup',
    loadChildren: () => import('./pages/signup/signup.module').then(m => m.SignupModule)
  },
  {
    path: 'admin/login',
    loadChildren: () => import('./pages/admin/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'admin/signup',
    loadChildren: () => import('./pages/admin/signup/signup.module').then(m => m.SignupModule)
  },
  {
    path: 'admin/dashboard',
    loadChildren: () => import('./pages/admin/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: "**",
    component: BodyComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}