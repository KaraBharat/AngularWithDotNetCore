import { AlertifyService } from './../../_services/alertify.service';
import { UserService } from './../../_services/user.service';
import { User } from './../../_models/user';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {

  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  user: User;

  constructor(
    private userService: UserService,
    private alertify: AlertifyService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.loadUser();

    this.galleryOptions = [
      {
          width: '690px',
          height: '600px',
          imagePercent: 100,
          thumbnailsColumns: 4,
          imageAnimation: NgxGalleryAnimation.Slide,
          preview: false
      }
    ];

    this.galleryImages = this.loadUserImages();
  }

  loadUser() {
    this.route.data.subscribe(data => {
      this.user = data['user'];
    });
  }

  loadUserImages() {
    const imageUrls = [];
    this.user.photos.forEach(element => {
      imageUrls.push({
        small: element.url,
        medium: element.url,
        big: element.url,
        description: element.description
      });
    });

    return imageUrls;
  }
}
