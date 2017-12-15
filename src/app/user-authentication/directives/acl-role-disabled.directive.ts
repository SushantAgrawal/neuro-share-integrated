import { Directive, ElementRef, Renderer, Input, OnInit } from '@angular/core';


import { AclService } from './../services/acl.service';
import { SessionService } from './../services/session.service';

import { SupportService } from "@sutterhealth/data-services";
import * as _ from 'lodash';

@Directive({
    selector: '[aclRoleDisabled]'
})
/**
 * Directive to show/hide element if the logged user has permission depending on his role
 */
export class AclRoleDisabledDirective implements OnInit {
    @Input()
    private rolePermission: any;

    private element: Node;
    currentRole: any = null;
    roles: any = null;
    userHasRole: boolean = false;

    constructor(private el: ElementRef, private renderer: Renderer, private support: SupportService, private acl: AclService, private session: SessionService) { }
    /**
     * Transform the current role for better readibility
     * @param role
     */
    _transformRole(role: any) {
        if (role === 'Admin') {
            return 'administrator';
        }
        return role.toLowerCase();
    }
    /**
     * Check if the logged user has a role
     * @param role The role the logged user has
     */
    _hasRole(role: any) {
        if (_.first(role) === '!') {
            role = role.substring(1);
            return this.currentRole !== this._transformRole(role);
        } else {
            return this.currentRole === this._transformRole(role);
        }
    }
    /**
     * Validate if the user has permission to see the element, if not, hide it.
     */
    _validate() {
        this.currentRole = this.acl.getUserRole();

        if (this.roles.length === 1) {
            this.userHasRole = this._hasRole(_.first(this.roles));
        } else {
            for (let role of this.roles) {
                if (this._hasRole(role)) {
                    this.userHasRole = true;
                    break;
                }
            }
        }
        if (this.userHasRole) {
            this.renderer.setElementAttribute(this.element, 'disabled', 'false');
        } else {
            this.renderer.setElementAttribute(this.element, 'disabled', '');
        }
    }
    ngOnInit() {
        this.element = this.el.nativeElement;
        this.renderer.setElementAttribute(this.element, 'disabled', '');
        this.roles = this.rolePermission.split(' ');
        const sessionRoles = this.session.getRoles();
        if (_.isEmpty(sessionRoles)) {
            this.support.getRoles().subscribe((roles: any) => {
                this.session.setRoles(roles);
                this._validate();
            });
        } else {
            this._validate();
        }
        this.session.getUser().subscribe(() => {
            this._validate();
        })
    }


}
