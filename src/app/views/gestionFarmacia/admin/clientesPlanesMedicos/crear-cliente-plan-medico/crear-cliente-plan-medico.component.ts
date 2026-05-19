import { Component,OnInit } from '@angular/core';
import { FirebaseRealTimeDatabaseService } from '../../../../../services/firebase-Realtime-Database.service'; 
import { FirebaseAuthService } from '../../../../../services/firebase-auth.service'; 
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { alertResultado } from '../../../../../services/utils';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-crear-cliente-plan-medico',
  standalone: true,
  imports: [FormsModule, CommonModule, NavbarComponent],
  templateUrl: './crear-cliente-plan-medico.component.html',
  styleUrl: './crear-cliente-plan-medico.component.css'
})
export class CrearClientePlanMedicoComponent implements OnInit {
  mensajeInsertado = false; 
  autenticado: boolean = false;
  nombre: string = '';
  dpi: string = '';
  nit: string = '';
  celular: string = '';
  correo: string = '';
  clave: string = '';
  medicamento: string = '';
  laboratorio: string = '';
  bulkData: string = ''; // Para almacenar los datos en formato tabular
  datosProcesados: any[] = []; // Para almacenar los datos procesados
  constructor(
    private firebaseRealtimeDatabaseService: FirebaseRealTimeDatabaseService,
    private authService: FirebaseAuthService,
    private router:Router 
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.autenticado = true; 
      } else {
        this.router.navigate(['/login']); 
      }
    });
  }
  insertar() {
    const rutaRedireccion = '/crear-cliente-plan-medico';
    const carpeta ="clientesPlanMedico";
    const datos = {
      nombre : this.nombre,
      dpi :this.dpi,
      nit :this.nit,
      celular :this.celular,
      correo :this.correo,
      clave :this.clave,
      medicamento :this.medicamento,
      laboratorio: this.laboratorio
    };
  const claves = ['nombre', 'dpi', 'nit', 'celular', 'correo', 'clave', 'medicamento', 'laboratorio'] as const;
  claves.forEach(key => {
    if (datos[key] === '') {
      datos[key] = "No disponible";
    }
  });
    alertResultado('crear', this.nombre, () => this.firebaseRealtimeDatabaseService.insertar(carpeta,datos),rutaRedireccion);
  }
  
  regresar() {
    this.router.navigate(['/lista-cliente-plan-medico']); 
  }
}
