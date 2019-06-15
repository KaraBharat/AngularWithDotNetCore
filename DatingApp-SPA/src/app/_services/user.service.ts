import { PaginatedResults } from './../_models/pagination';
import { User } from './../_models/user';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  baseUrl = environment.APIUrl + 'users/';

  constructor(private http: HttpClient) { }

  getUsers(page?, itemsPerPage?, userParams?): Observable<PaginatedResults<User[]>> {

    const paginatedResults: PaginatedResults<User[]> = new PaginatedResults<User[]>();

    let params = new HttpParams();
    if (page != null && itemsPerPage != null) {
      params = params.append('pageNumber', page);
      params = params.append('pageSize', itemsPerPage);
    }

    if (userParams != null) {
      params = params.append('minAge', userParams.minAge);
      params = params.append('maxAge', userParams.maxAge);
      params = params.append('gender', userParams.gender);
      params = params.append('orderBy', userParams.orderBy);
    }

    return this.http.get<User[]>(this.baseUrl, { observe: 'response', params })
      .pipe(
        map(response => {
          paginatedResults.result = response.body;
          if (response.headers.get('Pagination') != null) {
            paginatedResults.pagination = JSON.parse(response.headers.get('Pagination'));
          }

          return paginatedResults;
        })
      );
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(this.baseUrl + id);
  }

  updateUser(id: number, user: User) {
    return this.http.put(this.baseUrl + id, user);
  }

  setMainPhoto(userId: number, id: number) {
    return this.http.post(this.baseUrl + userId + '/photos/' + id + '/setMain', {});
  }

  deletePhoto(userId: number, id: number) {
    return this.http.delete(this.baseUrl + userId + '/photos/' + id);
  }

}
