import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { AuthService } from './../../_services/auth.service';
import { User } from './../../_models/user';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent implements OnInit {

  @Input() user: User;

  constructor(
    private authService: AuthService,
    private alertify: AlertifyService,
    private userService: UserService) { }

  ngOnInit() {
  }

  likeUser() {
    const id = this.authService.getCurrentUser().id;
    this.userService.likeUser(id, this.user.id).subscribe(() => {
      this.alertify.success('You have liked : ' + this.user.knownAs);
    }, error => {
      this.alertify.error(error);
    });
  }
}
