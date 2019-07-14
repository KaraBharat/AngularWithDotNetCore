import { AlertifyService } from './../../_services/alertify.service';
import { AdminService } from './../../_services/admin.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-photo-management',
  templateUrl: './photo-management.component.html',
  styleUrls: ['./photo-management.component.css']
})
export class PhotoManagementComponent implements OnInit {

  photos: any[];

  constructor(
    private adminService: AdminService,
    private alertify: AlertifyService
    ) { }

  ngOnInit() {
    this.getPhotosForApproval();
  }

  getPhotosForApproval() {
    this.adminService.getPhotosForModetations()
      .subscribe((photos: any[]) => {
        this.photos = photos;
      }, error => {
        this.alertify.error(error);
      });
  }

  approvePhoto(photoId: number) {
    this.adminService.approvePhoto(photoId)
      .subscribe(() => {
        this.photos.splice(this.photos.findIndex(p => p.id === photoId), 1);
        this.alertify.success('Photo approved successfully');
      }, error => {
        this.alertify.error(error);
      });
  }

  rejectPhoto(photoId: number) {
    this.adminService.rejectPhoto(photoId)
      .subscribe(() => {
        this.photos.splice(this.photos.findIndex(p => p.id === photoId), 1);
        this.alertify.success('Photo rejected successfully');
      }, error => {
        this.alertify.error(error);
      });
  }
}
