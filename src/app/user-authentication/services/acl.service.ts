import { Injectable } from '@angular/core';
import { Location } from '@angular/common';

import { AuthenticationService } from './authentication.service';
import { SessionService } from './../services/session.service';
import { SupportService } from '@sutterhealth/data-services';
import * as _ from 'lodash';

@Injectable()
export class AclService {
  /**
   * Acl Service
   */
_aclMatrix: Object = {};
userRole: any;
  constructor(private location: Location, private auth: AuthenticationService, private support: SupportService, private session: SessionService) { 
    this._aclMatrix = this.auth.getMatrix();
  }

  /**
   * Function to get the current user  role
   */
  getUserRole() {
    return this.auth.getUserType();
  }
  /**
   * Get user Permissions
   */
  getUserPermissions() {
    let user = this.auth.getUser();
    if (user) {
      let userType = this.getUserRole();
      if (!!this._aclMatrix[userType]) {
        return this._aclMatrix[userType];
      }
    }
    return [];
  }
  /**
   * Get User Resource Permissions
   */
  getResourcePermission(resource: string) {
    let permissions = this.getUserPermissions();
    return permissions[resource];
  }
  /**
   * Check for current Resource (Usually is a URL Path)
   */
  getCurrentResource() {
    let path = _.first(this.location.path(false).split('?')).substring(1);
    return path;
  }

  /**
   * Check if the user has permission
   * @param route The route the user is trying to access
   */
  hasAccess(route: any) {
    return new Promise(resolve => {
      let sessionRoles = this.session.getRoles();
      let has: boolean = false;
      if (_.isEmpty(sessionRoles)) {
        this.support.getRoles().subscribe((roles:any) => {
          this.session.setRoles(roles);
         has = this._setAccess(roles, route);
          resolve(has);
        });
      } else {
        has =  this._setAccess(sessionRoles, route);
        resolve(has);
      }


    });
  }
  /**
   * Check if the user is Authorized
   */
  isAuthorized() {
    let flag = false;
    return this.hasAccess({});

  }
  /**
   * Check if the user has access
   * @param roles The roles that has access to a resource
   * @param route The route is trying to get access
   */
  _setAccess(roles: Array<Object>, route: any): boolean {
    let itHas: boolean = false;
    let r = route;
    let permission: any = route.permission || 'view';
    let resource: string = route.resource || '';
    let resourcePermissions = this.getResourcePermission(resource) || [];
    if (!r || resourcePermissions.length && !permission) {
      itHas = true;
    } else if (resourcePermissions.length && permission) {
      permission = (typeof permission === 'string') ? [permission] : permission;
      itHas = _.intersection(resourcePermissions, permission).length > 0;
    }
    return itHas;
  }
}
