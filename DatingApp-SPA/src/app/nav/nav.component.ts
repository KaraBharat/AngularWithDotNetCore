import { MessageService } from './../_services/message.service';
import { AuthService } from './../_services/auth.service';
import { Component, OnInit } from '@angular/core';
import { AlertifyService } from '../_services/alertify.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  model: any = {};
  profilePhotoUrl: string;

  constructor(public authService: AuthService,
              private alertify: AlertifyService,
              private router: Router,
              public messageService: MessageService
              ) { }

  ngOnInit() {
    this.authService.currentProfilePhotoUrl.subscribe(photoUrl => this.profilePhotoUrl = photoUrl);
    if (this.authService.getCurrentUser()) {
      this.messageService.getUnReadCount(this.authService.getCurrentUser().id);
    }
  }

  login() {
    this.authService.login(this.model).subscribe(next => {
      this.alertify.success('Logged in successfully');
      this.router.navigate(['/members']);
    }, error => {
      this.alertify.error(error);
    });
  }

  loggedIn() {
    return this.authService.loggedIn();
  }

  logout() {
    this.authService.logout();
    this.alertify.info('Logout successfully');
    this.router.navigate(['/home']);
  }
}
