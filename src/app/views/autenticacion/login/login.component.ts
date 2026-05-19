import { Component } from '@angular/core';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CrearProductoMalEstadoComponent } from '../../../views/gestionFarmacia/admin/productoMalEstado/crear-producto-mal-estado/crear-producto-mal-estado.component';
import { FormsModule } from '@angular/forms';
import { alertExito, alertError } from '../../../services/utils';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, CrearProductoMalEstadoComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  autenticado: boolean = false;
  errorMensaje: string = '';

  constructor(
    private authService: FirebaseAuthService,
    private router: Router
  ) {}

  autenticarUsuario() {
    this.authService.login(this.email, this.password)
      .then(() => {
        this.router.navigate(['/menu-administrativo']).then(() => {
          alertExito('¡Éxito!', `Bienvenido, ${this.email}.`, this.router,'/menu-administrativo');
        });
      })
      .catch((error) => {
        console.error('Error al autenticar al usuario', error);
        this.errorMensaje = 'Credenciales incorrectas.';
        alertError('Credenciales incorrectas.');
      });
  }

  // Función para que la manta haga click sobre el select
  triggerSelectClick() {
    const selectElement = document.getElementById('emailSelect') as HTMLSelectElement;
    selectElement?.click();
  }

  regresar() {
    this.router.navigate(['/menu']);
  }
}
