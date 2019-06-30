import { AuthService } from './../_services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  registerMode = false;

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

  enableRegisterMode() {
    this.registerMode = true;
  }

  loggedIn() {
    return this.authService.loggedIn();
  }

  onCancelRegister(registerMode: boolean) {
    this.registerMode = registerMode;
  }
}
