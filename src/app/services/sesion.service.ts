import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SesionService {

  getUsuario() {
    const data = localStorage.getItem('usuarioActivo');
    return data ? JSON.parse(data) : null;
  }

  getNombre() {
    return this.getUsuario()?.nombre;
  }

  getRol() {
    return this.getUsuario()?.rol;
  }

  getCodigo() {
    return this.getUsuario()?.usuario;
  }
  getRevisaA() {
    return this.getUsuario()?.revisa_a;
  }

  logout() {
    localStorage.removeItem('usuarioActivo');
  }

}