import { Directive, ElementRef, Renderer, Input, OnInit } from '@angular/core';

import { AclService } from './../services/acl.service';
import { SessionService } from './../services/session.service';


@Directive({
  selector: '[aclAction]'
})
export class AclActionDirective implements OnInit {

  @Input() private permission: any;


  private element: Node;
  /**
   * Directive to show/hide element if the logged user has no permission to perform action
   */
  constructor(private el: ElementRef, private acl: AclService, private renderer: Renderer, private session: SessionService) { }
  /**
   * Check if the user has access
   */
  setAccess() {
    let permission = this.permission || 'view';
    let _acl: Object = {
      permission: permission,
      resource: this.acl.getCurrentResource()
    };

    this.acl.hasAccess(_acl).then((accesible) => {
      if (accesible) {
        this.renderer.setElementStyle(this.element, 'display', '');
      } else {
        this.renderer.setElementStyle(this.element, 'display', 'none');
      }
    });
  }
  ngOnInit() {
    this.element = this.el.nativeElement;
    /**
     * Hide the element by default
     */
    this.renderer.setElementStyle(this.element, 'display', 'none');
    this.setAccess();

    this.session.getUser().subscribe(() => { this.setAccess(); });

  }
}
