import { Component, OnInit } from '@angular/core';
import { FirebaseRealTimeDatabaseService } from '../../../../../services/firebase-Realtime-Database.service';
import { FirebaseAuthService } from '../../../../../services/firebase-auth.service';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { alertResultado } from '../../../../../services/utils';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-editar-estanteria',
  standalone: true,
  imports: [FormsModule,CommonModule,NavbarComponent],
  templateUrl: './editar-estanteria.component.html',
  styleUrl: './editar-estanteria.component.css'
})
export class EditarEstanteriaComponent implements OnInit{
  autenticado: boolean = false;
  nombreEstanteria: string = '';
  cantidadColumnas: number = 0;
  cantidadFilas: number = 0;
  id: string = '';

  constructor(
    private firebaseRealtimeDatabaseService: FirebaseRealTimeDatabaseService,
    private authService: FirebaseAuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.autenticado = true;
        this.id = this.route.snapshot.paramMap.get('id') || '';
        if (this.id) {
          this.cargarProducto(this.id);
        }
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  cargarProducto(id: string) {
    const carpeta = "estanterias";
    this.firebaseRealtimeDatabaseService.obtenerPorId(id,carpeta).subscribe(producto => {
      if (producto) {
        this.nombreEstanteria= producto.nombreEstanteria;
        this.cantidadColumnas = producto.cantidadColumnas;
        this.cantidadFilas = producto.cantidadFilas;
      }
    });
  }

  editar() {
    const rutaRedireccion ="/lista-estanteria";
    const carpeta = "estanterias";
    const datos ={
      id: this.id,
      nombreEstanteria: this.nombreEstanteria,
      cantidadColumnas: this.cantidadColumnas,
      cantidadFilas: this.cantidadFilas
    }
    alertResultado('editar', this.nombreEstanteria, () => this.firebaseRealtimeDatabaseService.editar(carpeta,datos), rutaRedireccion);
  }
  regresar() {
    this.router.navigate(['/lista-estanteria']); 
  }
}
