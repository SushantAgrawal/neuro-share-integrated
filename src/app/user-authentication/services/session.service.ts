import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { OrchestratorService } from '@sutterhealth/data-services';
import { SupportService } from '@sutterhealth/data-services';

import 'rxjs/add/operator/share';

@Injectable()
export class SessionService {

  public userObservable: ReplaySubject<Object> = new ReplaySubject(1);
  public tokenObservable: ReplaySubject<any> = new ReplaySubject(1);
  patientId: string;
  userName: string;
  csn: string;
  params: any;
  user: Object = {};
  roles: Array<Object> = [];
  password: string;
  errorMsg: boolean = false;
  private temporaryQueryParams: any = {};
  private queryParams: any = {};

  constructor(private route: ActivatedRoute, private orchestrator: OrchestratorService, private supportService: SupportService) { }

 /**
  * Store in session for username
  * @param userName The logged user name
  */
  setUserName(userName: string) {
    this.userName = userName;
  }
  /**
   * Return the logged username
   */
  getUsername() {
    return this.userName;
  }
  /**
  * Return the logged patient Id
  */
  getPatientId() {
    return this.patientId;
  }
  /**
  * Store in session the access token
  * @param token access token
  */
  setToken(token: any) {
    this.tokenObservable.next(token);
  }
  /**
   * Return User token
   */
  getToken(): Observable<any> {
    return this.tokenObservable;
  }
  /**
   * reset Token
   */
  resetToken() {
    this.tokenObservable.next('');
  }
  /**
   * Return query params Observable
   */
  getParams() {
    return this.route.queryParams;
  }
  /**
   * Save extra params
   * @param params Extra params that could be need to be saved
   */
  setParams(params: any) {
    this.params = params;

  }
  /**
   * Save PatientId on sessions
   */
  setPatientId(patientId: string) {
    this.patientId = patientId;
  }
  /**
   * Get the savedContact serial Number
   */
  getCsn() {
    return this.csn;
  }
  /**
  * Store in session for Contact Serial Number
  * @param csn The Contact Serial Number to be saved
  */
  setCsn(csn: string) {
    this.csn = csn;
  }
  /**
  * Return the Logged user Observable
  */
  getUser(): Observable<Object> {
    return this.userObservable;
  }
  /**
  * Store in session for User object
  * @param userName The logged user name
  */
  setUser(user: any) {
    this.userObservable.next(user);
  }
  /**
   * Save on session the  current roles application 
   */
  setRoles(roles: Array<Object>) {
    this.roles = roles;
  }
  /**
   * Get the stored in session Roles
   */
  getRoles() {
    return this.roles;
  }

  /**
   * DEPRECATION NOTICE: THIS METHOD SHOULD BE REMOVED AFTER THE GRAIL APPLICATION HAS BEEN UPDATED
   * TO USE THE userLogin METHOD
   */

  /**
   * Login into application
   * @param credentials example: {username:"user", password:"password"}
   */
  login(credentials: any): any {
    return this.orchestrator.GRAILS.login(credentials);
  }

  /**
   * Support for a manual user login into an application
   * @param credentials example: {username:"user", password:"password", project:"pamf", solution:"PROMS", key:"ABCDEFG"}
   */
  userLogin(credentials: any): Observable<Object> {
    return this.supportService.login(credentials);
  }

}
