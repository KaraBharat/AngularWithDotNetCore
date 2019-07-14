import { map } from 'rxjs/operators';
import { RolesModalComponent } from './../roles-modal/roles-modal.component';
import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/_models/user';
import { AdminService } from 'src/app/_services/admin.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[];
  bsModalRef: BsModalRef;

  constructor(
    private adminService: AdminService,
    private alertify: AlertifyService,
    private modalService: BsModalService
    ) { }

  ngOnInit() {
    this.getUserWithRoles();
  }

  getUserWithRoles() {
    this.adminService.getUsersWithRoles()
      .subscribe((userlist: User[]) => {
        this.users = userlist;
      }, error => {
        this.alertify.error(error);
      });
  }

  editRolesModel(user: User) {
    const initialState = {
      user,
      roles: this.getRoles(user)
    };
    this.bsModalRef = this.modalService.show(RolesModalComponent, {initialState});
    this.bsModalRef.content.updateSelectedRoles.subscribe((vals) => {
      const roleToUpdate = {
        roleNames: [...vals.filter(el => el.checked === true).map(el => el.name)]
      };

      if (roleToUpdate) {
        this.adminService.updateUsersRoles(user, roleToUpdate).subscribe(() => {
          this.alertify.success('Role has been changed successfully');
          user.roles = [...roleToUpdate.roleNames];
        }, error => {
          this.alertify.error(error);
        });
      }
    });
  }

  private getRoles(user: User) {
    const roles = [];
    const userRoles = user.roles;

    const availableRoles: any[] = [
      {name: 'Admin', value: 'Admin'},
      {name: 'Moderator', value: 'Moderator'},
      {name: 'Member', value: 'Member'},
      {name: 'VIP', value: 'VIP'}
    ];

    for (let i = 0; i < availableRoles.length; i++) {
      let isMatch = false;
      for (let j = 0; j < userRoles.length; j++) {
        if (availableRoles[i].name === userRoles[j]) {
          isMatch = true;
          availableRoles[i].checked = true;
          roles.push(availableRoles[i]);
          break;
        }
      }

      if (!isMatch) {
        availableRoles[i].checked = false;
        roles.push(availableRoles[i]);
      }
    }

    return roles;
  }
}
