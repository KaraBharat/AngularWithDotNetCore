import { Message } from './../_models/message';
import { Component, OnInit } from '@angular/core';
import { Pagination, PaginatedResults } from '../_models/pagination';
import { MessageService } from '../_services/message.service';
import { AlertifyService } from '../_services/alertify.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {

  messages: Message[];
  pagination: Pagination;
  messageContainer = 'Unread';

  constructor(
    private messageService: MessageService,
    private alertify: AlertifyService,
    private route: ActivatedRoute,
    private authService: AuthService) { }

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    this.route.data.subscribe(data => {
      this.messages = data['messages'].result;
      this.pagination = data['messages'].pagination;
    });
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.refreshMessages();
  }

  deleteMessage(id: number) {
    const userId = this.authService.getCurrentUser().id;
    this.alertify.confirm('Are you sure.. You want to delete this message?', () => {
      this.messageService.deleteMessage(id, userId).subscribe(() => {
        this.messages.splice(this.messages.findIndex(m => m.id === id), 1);
        this.alertify.success('Messages has been deleted.');
      }, error => {
        this.alertify.error(error);
      });
    });
  }

  refreshMessages() {
    const userId = this.authService.getCurrentUser().id;
    this.messageService.getMessages(userId, this.pagination.currentPage, this.pagination.itemsPerPage, this.messageContainer)
      .subscribe((res: PaginatedResults<Message[]>) => {
        this.messages = res.result;
        this.pagination = res.pagination;
      }, error => {
        this.alertify.error(error);
      });
  }

}
