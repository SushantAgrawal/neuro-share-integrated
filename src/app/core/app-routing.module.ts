import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SnapshotComponent } from '../snapshot/snapshot.component';
import { UnauthorizedComponent } from '../unauthorized/unauthorized.component';
import { TimeoutComponent } from '../timeout/timeout.component';
const routes: Routes = [
  {
    path: '', component: SnapshotComponent, children: []
  },
  {
    path: 'snapshot', component: SnapshotComponent, children: []
  },
  {
    path: 'unauthorized', component: UnauthorizedComponent, children: []
  },
  {
    path: 'timeout', component: TimeoutComponent, children: []
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
