import { AuthService } from 'src/app/_services/auth.service';
import { Directive, Input, ViewContainerRef, TemplateRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective implements OnInit {
  @Input() appHasRole: string[];
  isVisible = false;

  constructor(
    private viewContainerRef: ViewContainerRef,
    private templeteRef: TemplateRef<any>,
    private authService: AuthService
    ) { }

  ngOnInit() {
    const userRoles = this.authService.decodedToken.role as Array<string>;

    // if there are not roles then clear the view container ref

    if (!userRoles) {
      this.viewContainerRef.clear();
    }

    // if user has roles then check the roles and render the element

    if (this.authService.roleMatch(this.appHasRole)) {
      if (!this.isVisible) {
        this.isVisible = true;
        this.viewContainerRef.createEmbeddedView(this.templeteRef);
      } else {
        this.isVisible = false;
        this.viewContainerRef.clear();
      }
    }
  }
}
