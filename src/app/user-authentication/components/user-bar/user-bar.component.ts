import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { AuthenticationService } from '../../services/authentication.service';
import { SupportService } from '@sutterhealth/data-services';

@Component({
  selector: 'app-user-bar',
  template: `<div *ngIf="userObject" class="flex-container user-data" fxLayout="row" fxLayout.xs="column" fxLayoutAlign="right center" fxLayoutAlign.xs="end">
    <div class="flex-item" fxFlex="100%" fxFlex.xs="20%">
        <div class="bold">WELCOME</div>
        <div >{{userObject.name}}</div>
    </div>
</div>`,
  styles:[`
  
.user-data{
    font-size:0.80em;
    margin-right: 30px;}`]
})
/**
 * Component that displays information of the logged user
 */
export class UserBarComponent implements OnInit {

  userObject: Object = null;

  // tslint:disable-next-line:max-line-length
  constructor(private sessionService: SessionService,  private supportService: SupportService, private router: Router, private authenticationService: AuthenticationService)
  // tslint:disable-next-line:one-line
  {

  }

  ngOnInit() {
    /**
     * Checking for Params
     */
    this.sessionService.getParams().subscribe(params => {
      if (params['Username']) {
        /**
         * If params are present check for the user profile
         */
        this.supportService.getProfile(this.authenticationService.project, params['Username']).subscribe((user: any) => {
          if (!user || !this.authenticationService.isTokenValidated()) {
            this.router.navigate(['/unauthorized']);
          } else {
            this.sessionService.setUser(user[0]);
            this.userObject = user[0];
          }
        }, (error: any) => this.router.navigate(['/unauthorized']));
      }
    });
  }

}
