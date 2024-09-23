import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Burayı ekleyin
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true, 
  imports: [FormsModule], 
})
export class SignupComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  signup() {
    this.authService.signup(this.email, this.password)
      .then(() => {
        this.router.navigate(['/map']); // Kayıt başarılıysa harita sayfasına yönlendir
      })
      .catch(error => {
        console.error('Kayıt hatası:', error);
      });
  }
}
