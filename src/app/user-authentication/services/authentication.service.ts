import { Injectable } from '@angular/core';
import { SessionService } from './session.service';
import * as _ from 'lodash';
import { SupportService } from '@sutterhealth/data-services';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/share';
import {InterceptorHttp } from '../interceptor/interceptor-http';

@Injectable()
export class AuthenticationService {
  _token: any = null;
  user: any;
  roles: Array<Object> = [];
  skipToken: boolean = false;
  aclMatrix: Object = {};
  userRole: string;
  project: string;

  private loggedInUserSource = new Subject<any>();

  loggedInUser$ = this.loggedInUserSource.asObservable();

  constructor(private sessionService: SessionService, private support: SupportService, private interceptor: InterceptorHttp) {
    setTimeout(() => {
      this.support.getRoles().subscribe((roles: any) => {
        this.roles = roles;
      });
    }, 2000);

    this.sessionService.getUser().subscribe(user => {
      this.user = user;

    });

    this.sessionService.getParams().subscribe((params) => {
      if (params['Username']) {
        this.support.getProfile(this.project, params['Username']).subscribe(user => {
          this.sessionService.setUser(_.first(user));
        });
      }
      if (params['token']) {
        this._token = params['token'];
      }
    });
  }
  /**
   * Check if the user has the requested role
   * @param type Role to check
   */
  isUserType(type: any) {
    return this.getUserType() === type.toLowerCase();
  }

  getUserType() {
    if (this.user && this.user['roles'].length > 0) {
      return this.user.roles[0].role_name.toLowerCase();
    }
    return null;
  }
  /**
   * Return the user
   */
  getUser() {
    return this.sessionService.getUser();
  }
  /**
   * Clear the token
   */
  cleanToken() {
    this._token = {};
  }
  /**
   * Get the token
   */
  getToken(): any {
    return this._token;
  }
  /**
   * Set the access token for the interceptor
   * @param token Token access
   */
  setAccessToken(token: any) {
    this._token = token;
  }
  /**
   * Set the Matrix of App permissions
   * @param matrix  Matrix for permissions example {
    provider: { '': ['view'] },
    psr: { '': ['view'] },
    ma: { '': ['view'] },
    dc: { '': ['view'] },
    do: { '': ['view'] },
    np: { '': ['view'] }
  }
   */
  setMatrix(matrix: Object = {}) {
    this.aclMatrix = matrix;
  }
  /**
   * Return the permissions of the application
   */
  getMatrix(): Object {
    return this.aclMatrix;
  }
  /**
   * Set the project name
   */
  setProject(project: string) {
    this.project = project;
  }
  /**
   * Return the project name
   */
  getProject(): string {
    return this.project;
  }
  /**
   * Set to true to avoid for token validation
   * @param skip default: false
   */
  skipValidation(skip: boolean = false) {
    this.skipToken = skip;
    if(!this.skipToken){
      this.interceptor.start();
    }
  }
  /**
   * Check for token validation
   */
  isTokenValidated() {
    let token = this._token;
    if (token) {
      return true;
    }

    return this.skipToken;
  }
}
