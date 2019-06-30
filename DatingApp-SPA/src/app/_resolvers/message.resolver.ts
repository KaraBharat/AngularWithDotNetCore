import { AuthService } from './../_services/auth.service';
import { MessageService } from './../_services/message.service';
import { catchError } from 'rxjs/operators';
import { AlertifyService } from '../_services/alertify.service';
import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Message } from '../_models/message';

@Injectable()

export class MessageResolver implements Resolve<Message[]> {
    pageNumber = 1;
    pageSize = 5;
    messageContainer = 'Unread';

    constructor(
        private messageService: MessageService,
        private router: Router,
        private alertify: AlertifyService,
        private authService: AuthService) {
    }

    resolve(): Observable<Message[]> {
        const userId = this.authService.getCurrentUser().id;
        return this.messageService.getMessages(userId, this.pageNumber, this.pageSize, this.messageContainer).pipe(
            catchError(error => {
                this.alertify.error('Problem retriving messages');
                this.router.navigate(['/home']);
                return of(null);
            })
        );
    }
}
