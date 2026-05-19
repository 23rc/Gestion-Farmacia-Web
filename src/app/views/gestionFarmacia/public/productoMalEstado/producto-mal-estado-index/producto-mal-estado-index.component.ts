import { Component,OnInit } from '@angular/core';
import { FirebaseRealTimeDatabaseService } from '../../../../../services/firebase-Realtime-Database.service'; 
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
declare var $: any; 
import { alertEliminar } from '../../../../../services/utils';

@Component({
  selector: 'app-producto-mal-estado-index',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './producto-mal-estado-index.component.html',
  styleUrl: './producto-mal-estado-index.component.css'
})
export class ProductoMalEstadoIndexComponent implements OnInit {
  productos: any[] = [];
  productosFiltrados: any[] = []; // Array para los productos filtrados

  constructor(
    private firebaseService: FirebaseRealTimeDatabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const carpeta = 'productosMalEstado';
    this.firebaseService.listado(carpeta).subscribe((productos) => {
      this.productos = productos;
      this.productosFiltrados = productos; // Inicializar con todos los productos
    });
  }

  filtrarProductos(event: Event): void {
    const input = event.target as HTMLInputElement; // Asegurarse de que es un input
    const filtro = input.value.toLowerCase(); // Obtener el valor del input
    this.productosFiltrados = this.productos.filter(producto =>
      producto.codigo.toString().toLowerCase().includes(filtro) || // Filtrar por cantidad
      producto.cantidad.toString().toLowerCase().includes(filtro) || // Filtrar por cantidad
      producto.producto.toLowerCase().includes(filtro) || // Filtrar por nombre del medicamento
      producto.descripcion.toLowerCase().includes(filtro) // Filtrar por descripción
    );
  }
  

  regresar() {
    this.router.navigate(['/menu']);
  }
  estanteria() {
    this.router.navigate(['/estanteria']);
  }
  
}
