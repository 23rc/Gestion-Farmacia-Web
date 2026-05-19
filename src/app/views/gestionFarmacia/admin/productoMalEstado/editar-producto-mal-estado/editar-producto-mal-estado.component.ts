import { Component, OnInit } from '@angular/core';
import { FirebaseRealTimeDatabaseService } from '../../../../../services/firebase-Realtime-Database.service';
import { FirebaseAuthService } from '../../../../../services/firebase-auth.service';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { alertResultado } from '../../../../../services/utils';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-editar-producto-mal-estado',
  standalone: true,
  imports: [CommonModule, FormsModule,NavbarComponent],
  templateUrl: './editar-producto-mal-estado.component.html',
  styleUrl: './editar-producto-mal-estado.component.css'
})
export class EditarProductoMalEstadoComponent implements OnInit {
  autenticado: boolean = false;
  producto: string = '';
  cantidad: number = 0;
  descripcion: string = '';
  id: string = '';
  codigo:string='';

  constructor(
    private firebaseRealtimeDatabaseService: FirebaseRealTimeDatabaseService,
    private authService: FirebaseAuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  // ngOnInit() {
  //   this.authService.user$.subscribe(user => {
  //     if (user) {
  //       this.autenticado = true;
  //       this.id = this.route.snapshot.paramMap.get('id') || '';
  //       if (this.id) {
  //         this.cargarProducto(this.id);
  //       }
  //     } else {
  //       this.router.navigate(['/login']);
  //     }
  //   });
  // }
  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    if (this.id) {
      this.cargarProducto(this.id);
    }
  }
  
  cargarProducto(id: string) {
    const carpeta = "productosMalEstado";
    this.firebaseRealtimeDatabaseService.obtenerPorId(id,carpeta).subscribe(producto => {
      if (producto) {
        this.codigo = producto.codigo;
        this.producto = producto.producto;
        this.cantidad = producto.cantidad;
        this.descripcion = producto.descripcion;
      }
    });
  }

  editar() {
    const rutaRedireccion ="/lista-producto-mal-estado";
    const carpeta = "productosMalEstado";
    const datos ={
      id: this.id,
      codigo: this.codigo,
      producto: this.producto,
      cantidad: this.cantidad,
      descripcion: this.descripcion
    }
    alertResultado('editar', this.producto, () => this.firebaseRealtimeDatabaseService.editar(carpeta,datos), rutaRedireccion);
  }
  regresar() {
    this.router.navigate(['/lista-producto-mal-estado']); 
  }
}
