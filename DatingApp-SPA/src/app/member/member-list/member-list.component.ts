import { AuthService } from './../../_services/auth.service';
import { Pagination, PaginatedResults } from './../../_models/pagination';
import { User } from '../../_models/user';
import { AlertifyService } from '../../_services/alertify.service';
import { UserService } from '../../_services/user.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {

  users: User[];
  user: User;
  pagination: Pagination;
  userParams: any = {};

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private alertify: AlertifyService,
    private route: ActivatedRoute) { }
    public genderList = [{ value: 'male', display: 'Males' }, { value: 'female', display: 'Females' }];

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    this.loadUsers();
    this.resetFilterParams();
  }

  loadUsers() {
    this.route.data.subscribe(data => {
      this.users = data['users'].result;
      this.pagination = data['users'].pagination;
    });
  }

  resetFilterParams() {
    this.userParams.minAge = 18;
    this.userParams.maxAge = 99;
    this.userParams.gender = this.user.gender === 'male' ? 'female' : 'male';
    this.userParams.orderBy = 'lastActive';
  }

  resetFilters() {
    this.resetFilterParams();
    this.refreshUsers();
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.refreshUsers();
  }

  refreshUsers() {
    this.userService.getUsers(this.pagination.currentPage, this.pagination.itemsPerPage, this.userParams)
      .subscribe((res: PaginatedResults<User[]>) => {
        this.users = res.result;
        this.pagination = res.pagination;
      }, error => {
        this.alertify.error(error);
      });
  }
}
