import { map, tap } from 'rxjs/operators';
import { Message } from './../../_models/message';
import { AlertifyService } from './../../_services/alertify.service';
import { AuthService } from './../../_services/auth.service';
import { MessageService } from './../../_services/message.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements OnInit {
  @Input() recipientId: number;
  userid: number;
  messages: Message[];
  newMessage: any = {};

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private alertify: AlertifyService
  ) {
    this.userid = this.authService.getCurrentUser().id;
  }

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    this.messageService.getMessageThread(this.userid, this.recipientId)
      .pipe(
        tap(messages => {
          this.markMessagesAsRead(messages);
        })
      )
      .subscribe(messages => {
        this.messages = messages;
      }, error => {
        this.alertify.error(error);
      });
  }

  private markMessagesAsRead(messages: Message[]) {
    messages.forEach(message => {
      if (message.isRead === false && message.recipientId === this.userid) {
        this.messageService.markAsRead(message.id, this.userid);
        if (this.messageService.unreadMessageCounter && this.messageService.unreadMessageCounter.unreadMessageCount > 0) {
          this.messageService.unreadMessageCounter.unreadMessageCount--;
        }
      }
    });
  }

  sendMessage() {
    this.newMessage.recipientId = this.recipientId;
    this.messageService.sendMessage(this.userid, this.newMessage)
      .subscribe((message: Message) => {
        this.messages.unshift(message);
        this.newMessage.content = '';
      }, error => {
        this.alertify.error(error);
      });
  }

}
