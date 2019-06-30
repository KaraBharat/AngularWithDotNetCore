import { Message } from './../_models/message';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { PaginatedResults } from '../_models/pagination';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  baseUrl = environment.APIUrl + 'users/';
  public unreadMessageCounter: any = {};
  public unreadMessageTimerId = null;
  constructor(private http: HttpClient) { }

  getMessages(id: number, page?, itemsPerPage?, messageContainer?): Observable<PaginatedResults<Message[]>> {

    const paginatedResults: PaginatedResults<Message[]> = new PaginatedResults<Message[]>();

    let params = new HttpParams();
    if (page != null && itemsPerPage != null) {
      params = params.append('pageNumber', page);
      params = params.append('pageSize', itemsPerPage);
    }

    if (messageContainer != null) {
      params = params.append('messageContainer', messageContainer);
    }

    return this.http.get<Message[]>(this.baseUrl + id + '/messages', { observe: 'response', params })
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

  getMessageThread(id: number, recipientId: number) {
    return this.http.get<Message[]>(this.baseUrl + id + '/messages/thread/' + recipientId);
  }

  sendMessage(id: number, message: Message) {
    return this.http.post(this.baseUrl + id + '/messages', message);
  }

  deleteMessage(id: number, userId: number) {
    return this.http.post(this.baseUrl + userId + '/messages/' + id, {});
  }

  getUnReadCount(userId: number) {

    this.http.get<number>(this.baseUrl + userId + '/messages/unread/count')
      .subscribe(count => this.unreadMessageCounter.unreadMessageCount = count);

    if (!this.unreadMessageCounter.started) {

      if (this.unreadMessageTimerId) {
        clearTimeout(this.unreadMessageTimerId);
      }

      this.unreadMessageTimerId = setInterval(() =>
        this.http.get<number>(this.baseUrl + userId + '/messages/unread/count')
        .subscribe(count => this.unreadMessageCounter.unreadMessageCount = count)
      , 120000);

      this.unreadMessageCounter.started = true;
    }
  }

  markAsRead(id: number, userId: number) {
    return this.http.post(this.baseUrl + userId + '/messages/' + id + '/read', {}).subscribe();
  }
}
