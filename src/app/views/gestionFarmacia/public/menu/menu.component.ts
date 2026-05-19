import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {

  alertExito,
  alertError,
  alertEliminar

} from '../../../../services/utils';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  mostrarAcceso: boolean = false;

  usuario: string = '';
  password: string = '';
  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {

    localStorage.removeItem('usuarioActivo');

  }

  productoMalEstado() {
    this.router.navigate(['/producto-mal-estado-index']);
  }
  vinculoEstanteria() {
    this.router.navigate(['/estanteria']);
  }
  vinculoAdministrativo() {
    this.router.navigate(['/login']);
  }
  vinculoClientePlanMedico() {
    this.router.navigate(['/cliente-plan-medico']);
  }
  inventarioDiario() {
    this.router.navigate(['/inventario-diario']);
  }


  abrirAccesoInventario() {
    this.usuario = '';
    this.password = '';
    this.mostrarAcceso = true;
  }

  accederInventario() {

    const user = environment.usuarios.find(u =>
      u.usuario === this.usuario &&
      u.password === this.password
    );

    if (user) {

      const sesion = {

        nombre: user.nombre,

        usuario: user.usuario,

        rol: user.rol,

        revisa_a: user.revisa_a

      };

      localStorage.setItem('usuarioActivo', JSON.stringify(sesion));

      this.mostrarAcceso = false;

      // (opcional pero recomendable)
      alertExito(
        "Acceso correcto",
        `Bienvenido ${user.nombre}`,
        this.router,
        '/inventario-diario'
      );

      this.router.navigate(['/inventario-diario']);

    } else {

      alertError("Usuario o contraseña incorrectos");

    }

  }
}
