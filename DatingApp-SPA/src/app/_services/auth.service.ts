import { User } from './../_models/user';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  baseUrl = environment.APIUrl + 'auth/';
  jwtHelper = new JwtHelperService();
  decodedToken: any;
  currentUser: User;
  profilePhotoUrl = new BehaviorSubject<string>('../../assets/user.png');
  currentProfilePhotoUrl = this.profilePhotoUrl.asObservable();

  constructor(private http: HttpClient) { }

  changeMemberProfilePhoto(photoUrl: string, updateInLocalStorage: boolean) {
    this.profilePhotoUrl.next(photoUrl);

    if (updateInLocalStorage) {
      this.currentUser.photoUrl = photoUrl;
      localStorage.setItem('user', JSON.stringify(this.currentUser));
    }
  }

  login(loginData) {
    return this.http.post(this.baseUrl + 'login', loginData)
      .pipe(
        map((response: any) => {
          const user = response;
          if (user) {
            localStorage.setItem('token', user.token);
            localStorage.setItem('user', JSON.stringify(user.user));
            this.decodeUserToken();
            this.changeMemberProfilePhoto(this.currentUser.photoUrl, false);
          }
        })
      );
  }

  register(registerData: any) {
    return this.http.post(this.baseUrl + 'register', registerData);
  }

  loggedIn() {
    const token = localStorage.getItem('token');
    return !this.jwtHelper.isTokenExpired(token);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.decodedToken = null;
    this.currentUser = null;
  }

  decodeUserToken() {
    const token = localStorage.getItem('token');
    this.decodedToken = this.jwtHelper.decodeToken(token);

    const user: User = JSON.parse(localStorage.getItem('user'));
    this.currentUser = user;
    this.changeMemberProfilePhoto(this.currentUser.photoUrl, false);
  }

  currentUserToken() {
    return localStorage.getItem('token');
  }
}

