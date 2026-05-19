import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, onAuthStateChanged, setPersistence, browserLocalPersistence } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  user$ = new BehaviorSubject<any>(null); 

  constructor(private auth: Auth) {
    onAuthStateChanged(this.auth, user => {
      this.user$.next(user);
      console.log('Estado de autenticación cambiado:', user);
    });
  }
  login(email: string, password: string) {
    return this.auth.setPersistence(browserLocalPersistence)
      .then(() => {
        return signInWithEmailAndPassword(this.auth, email, password);
      })
      .catch(error => {
        console.error("Error al configurar la persistencia o autenticar el usuario", error);
        throw error;
      });
  }
  logout() {
    return this.auth.signOut();
  }
}
