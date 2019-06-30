import { AlertifyService } from './../../_services/alertify.service';
import { User } from './../../_models/user';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';
import { TabsetComponent } from 'ngx-bootstrap';
import { AuthService } from 'src/app/_services/auth.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit {

  @ViewChild('memberTabs') memberTabs: TabsetComponent;
  currentUserId: number;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];

  user: User;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute) {
      this.currentUserId = this.authService.getCurrentUser().id;
    }

  ngOnInit() {
    this.loadUser();

    this.route.queryParams.subscribe(params => {
      const tabId = params['tab'];
      if (tabId && tabId > 0) {
        this.selectTab(tabId);
      }
    });

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

  selectTab(tabId: number) {
    this.memberTabs.tabs[tabId].active = true;
  }
}
