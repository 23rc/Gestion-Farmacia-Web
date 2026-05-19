import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { Observable } from 'rxjs';
import { map, filter, first } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
  })
  export class AuthGuard implements CanActivate {
    constructor(
      private authService: FirebaseAuthService,
      private router: Router
    ) {}

    canActivate(): Observable<boolean> {
      return this.authService.user$.pipe(
        filter(user => user !== null), 
        first(), 
        map(user => {
          console.log('Valor del usuario en AuthGuard después de restaurar sesión:', user);
          if (user) {
            return true; 
          } else {
            console.log('Usuario no autenticado. Redirigiendo al login.');
            this.router.navigate(['/login']); 
            return false;
          }
        })
      );
    }
  }