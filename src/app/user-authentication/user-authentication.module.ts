import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule, Http, XHRBackend, RequestOptions } from '@angular/http';
import { ActivatedRoute } from '@angular/router';
import { AuthRoutingModule } from './auth-routing.module';

// Services
import { SessionService } from './services/session.service';
import { AuthenticationService } from './services/authentication.service';
import { AclService } from './services/acl.service';

// Directives
import { AclActionDirective } from './directives/acl-action.directive';
import { AclResourceDirective } from './directives/acl-resource.directive';
import { AclRoleDirective } from './directives/acl-role.directive';
import { AclRoleDisabledDirective } from './directives/acl-role-disabled.directive';


// Interceptor
import { InterceptorHttp } from './interceptor/interceptor-http';
import { HttpInterceptorModule } from 'ng-http-interceptor';

// Components
import { TimeoutComponent } from './components/timeout/timeout.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { UserBarComponent } from './components/user-bar/user-bar.component';

import { ServicesSdkModule, SdkService} from '@sutterhealth/data-services';

// Directives
export * from './directives/acl-action.directive';
export * from './directives/acl-resource.directive';
export * from './directives/acl-role.directive';

// Components
export * from './components/timeout/timeout.component';
export * from './components/unauthorized/unauthorized.component';
export * from './components/user-bar/user-bar.component';

// Interceptor
export * from './interceptor/interceptor-http';

// Services
export * from './services/acl.service';
export * from './services/authentication.service';
export * from './services/session.service';

// Modules
export * from './auth-routing.module';

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    AuthRoutingModule,
    ServicesSdkModule,
    HttpInterceptorModule,
    ServicesSdkModule.forRoot()
  ],
  declarations: [
    AclActionDirective,
    AclResourceDirective,
    AclRoleDirective,
    AclRoleDisabledDirective,
    TimeoutComponent, 
    UnauthorizedComponent,
    UserBarComponent
  ],
  exports: [
    AclActionDirective,
    AclResourceDirective,
    AclRoleDirective,
    AclRoleDisabledDirective,
    TimeoutComponent, 
    UnauthorizedComponent,
    UserBarComponent
  ],
  providers: [
    SessionService,
    AuthenticationService,
    AclService,
    InterceptorHttp
  ]
})
export class AuthenticationModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AuthenticationModule,
      providers: [SessionService,
      AuthenticationService,
      AclService,
      InterceptorHttp]
    };
  }
}
