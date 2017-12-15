import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TimeoutComponent } from './components/timeout/timeout.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';

const routes: Routes = [{
  path: 'unauthorized', component: UnauthorizedComponent, children: []},
  {path: 'timeout', component: TimeoutComponent, children: []}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AuthRoutingModule { }
