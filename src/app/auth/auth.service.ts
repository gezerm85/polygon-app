import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, User } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isLoggedInStatus: boolean = false; 
  public user: User | null = null;
  public router: Router; 

  constructor(private auth: Auth, router: Router) {
    this.router = router;
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.isLoggedInStatus = true;
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user)); 
        this.router.navigate(['/map']); 
      } else {
        this.isLoggedInStatus = false;
        this.user = null;
        localStorage.removeItem('user'); 
        this.router.navigate(['/login']);
      }
    });
  }

  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    this.isLoggedInStatus = true;
    this.user = userCredential.user;
    localStorage.setItem('user', JSON.stringify(this.user));
    this.router.navigate(['/map']);
  }

  async signup(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    this.isLoggedInStatus = true;
    this.user = userCredential.user;
    localStorage.setItem('user', JSON.stringify(this.user));
    this.router.navigate(['/map']);
  }

  isLoggedIn(): boolean {
    return this.isLoggedInStatus;
  }

  async logout() {
    try {
      await this.auth.signOut();
      localStorage.removeItem('user'); 
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Çıkış yaparken bir hata oluştu:', error);
    }
  }
}
