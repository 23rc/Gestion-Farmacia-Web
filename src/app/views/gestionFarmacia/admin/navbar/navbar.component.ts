import { Component } from '@angular/core';
import { FirebaseAuthService } from '../../../../services/firebase-auth.service';
import { Router } from '@angular/router';
import { alertPeticion } from '../../../../services/utils';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  sidebarVisible: boolean = true; // Controla el sidebar PC

  constructor(
    private authService: FirebaseAuthService,
    private router: Router

  ) { }


  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  validarCrearEstanteria() {
    alertPeticion(() => {
      this.router.navigate(['/lista-estanteria']); // Navegar si el código es correcto
    });
  }
  validarInicio() {
    alertPeticion(() => {
      this.router.navigate(['/menu-administrativo']); // Navegar si el código es correcto
    });
  }
  cerrarSesion() {
    this.authService.logout()
      .then(() => {
        console.log('Sesión cerrada correctamente');
        this.router.navigate(['/menu']);
      })
      .catch(error => {
        console.error('Error al cerrar sesión', error);
      });
  }
}
