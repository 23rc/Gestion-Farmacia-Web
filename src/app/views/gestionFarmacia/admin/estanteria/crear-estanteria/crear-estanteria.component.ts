import { Component,OnInit } from '@angular/core';
import { FirebaseRealTimeDatabaseService } from '../../../../../services/firebase-Realtime-Database.service'; 
import { FirebaseAuthService } from '../../../../../services/firebase-auth.service'; 
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { alertResultado } from '../../../../../services/utils';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-crear-estanteria',
  standalone: true,
  imports: [FormsModule, CommonModule,NavbarComponent],
  templateUrl: './crear-estanteria.component.html',
  styleUrl: './crear-estanteria.component.css'
})
export class CrearEstanteriaComponent implements OnInit{
  mensajeInsertado = false; 
  autenticado: boolean = false;
  nombreEstanteria: string = '';
  cantidadColumnas: number = 0;
  cantidadFilas: number = 0;
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
    const rutaRedireccion = '/crear-estanteria';
    const carpeta="estanterias";
    const datos ={
      nombreEstanteria:this.nombreEstanteria,
      cantidadColumnas: this.cantidadColumnas,
      cantidadFilas: this.cantidadFilas
    }
    alertResultado('crear', this.nombreEstanteria, () => this.firebaseRealtimeDatabaseService.insertar(carpeta,datos),rutaRedireccion);
  }
  regresar() {
    this.router.navigate(['/lista-estanteria']); 
  }
}
