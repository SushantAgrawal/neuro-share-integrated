import { Directive, ElementRef, Renderer, Input, OnInit } from '@angular/core';

import { AclService } from './../services/acl.service';
import { SessionService } from './../services/session.service';

import { SupportService } from "@sutterhealth/data-services";
import * as _ from 'lodash';

@Directive({
  selector: '[aclResource]'
})
/**
 * Directive to show/hide element if the logged user has permission to accces a resource
 */
export class AclResourceDirective implements OnInit {

  @Input()
  private aclPermission: any;

  private element: Node;

  constructor(private el: ElementRef, private support: SupportService, private acl: AclService, private renderer: Renderer, private session: SessionService) {

  }

  ngOnInit() {
    this.element = this.el.nativeElement;
    /**
     * Hide element by default
     */
    this.renderer.setElementStyle(this.element, 'display', 'none');
    const sessionRoles = this.session.getRoles();

    this.session.getUser().subscribe(() => {
      if (_.isEmpty(sessionRoles)) {
        this.support.getRoles().subscribe((roles:any) => {
          this._setVisibility(roles);
        });
      } else {
        this._setVisibility(sessionRoles);
      }
    });
  }
/**
 * Set The visibility of the element
 * @param roles Check if user has role access and show/hide element
 */
  _setVisibility(roles: any) {
    this.session.setRoles(roles);
    const resource = this.aclPermission;
    const permissions = this.acl.getResourcePermission(resource);
    if (permissions) {
      this.renderer.setElementStyle(this.element, 'display', '');
    }
  }
}
