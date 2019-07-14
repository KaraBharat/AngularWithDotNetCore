import { User } from 'src/app/_models/user';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  baseUrl = environment.APIUrl + 'admin/';

  constructor(private http: HttpClient) { }

  getUsersWithRoles() {
     return this.http.get(this.baseUrl + 'usersWithRoles');
  }

  updateUsersRoles(user: User, roles: {}) {
    return this.http.post(this.baseUrl + 'editRoles/' + user.userName, roles);
  }

  getPhotosForModetations() {
    return this.http.get(this.baseUrl + 'photosForModeration');
  }

  approvePhoto(photoId: number) {
    return this.http.post(this.baseUrl + 'approvePhoto/' + photoId , {});
  }

  rejectPhoto(photoId: number) {
    return this.http.post(this.baseUrl + 'rejectPhoto/' + photoId , {});
  }
}
