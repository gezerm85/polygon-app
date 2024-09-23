import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import {FormsModule } from '@angular/forms';
import { MapComponent } from './map/map.component';
import { AuthService } from './auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MapComponent, RouterLink, FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(public authService: AuthService) {}
}
