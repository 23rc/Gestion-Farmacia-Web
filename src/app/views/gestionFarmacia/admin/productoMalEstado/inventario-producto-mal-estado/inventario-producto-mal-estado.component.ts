import { Component, OnInit } from '@angular/core';
import { FirebaseRealTimeDatabaseService } from '../../../../../services/firebase-Realtime-Database.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  
import { NavbarComponent } from '../../navbar/navbar.component';
import { alertExito } from '../../../../../services/utils'; 

@Component({
  selector: 'app-inventario-producto-mal-estado',
  standalone: true,
  imports: [FormsModule, CommonModule, NavbarComponent],
  templateUrl: './inventario-producto-mal-estado.component.html',
  styleUrls: ['./inventario-producto-mal-estado.component.css']
})
export class InventarioProductoMalEstadoComponent implements OnInit {
  productos: any[] = [];
  productosFiltrados: any[] = []; 
  searchTerm: string = ''; 

  constructor(
    private firebaseService: FirebaseRealTimeDatabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const carpeta = 'productosMalEstado';
    this.firebaseService.listado(carpeta).subscribe((productos) => {
      this.productos = productos.map((producto) => ({
        ...producto,
        existencia: false,
        cantidad: producto.cantidad || 0,
        modificado: false // Inicializamos como no modificado
      }));
      this.productosFiltrados = [...this.productos]; 
    });
  }

  filtrarProductos(): void {
    const searchTermLower = this.searchTerm.toLowerCase();
    this.productosFiltrados = this.productos.filter(producto =>
      producto.codigo.toLowerCase().includes(searchTermLower) ||
      producto.producto.toLowerCase().includes(searchTermLower)
    );
  }

  limpiarBuscador(): void {
    this.searchTerm = ''; 
    this.filtrarProductos(); 
  }

  // guardarDatos(): void {
  //   this.productos.forEach(producto => {
  //     if (producto.modificado) { // Solo procesar productos modificados
  //       if (producto.vendido) {
  //         this.firebaseService.eliminar(producto.id, 'productosMalEstado').then(() => {
  //           alertExito(
  //             'Producto Eliminado',
  //             `El producto ${producto.producto} ha sido eliminado.`,
  //             this.router,
  //             '/menu-administrativo'
  //           );
  //         }).catch(error => {
  //           console.error('Error al eliminar el producto:', error);
  //         });
  //       } else if (producto.cantidad !== undefined && producto.cantidad >= 0) {
  //         this.firebaseService.editar('productosMalEstado', producto).then(() => {
  //           console.log(`Cantidad actualizada para el producto ${producto.producto}`);
  //         }).catch(error => {
  //           console.error('Error al actualizar la cantidad:', error);
  //         });
  //       }
  //       producto.existencia = false;
  //       producto.modificado = false; 
  //     }
  //   });
  // }
  guardarDatos(): void {
    // Array para almacenar todas las promesas
    const operaciones: Promise<any>[] = [];
  
    this.productos.forEach(producto => {
      if (producto.modificado) { // Solo procesar productos modificados
        if (producto.vendido) {
          // Agregar la operación de eliminación al array
          const eliminacion = this.firebaseService.eliminar(producto.id, 'productosMalEstado');
          operaciones.push(eliminacion);
        } else if (producto.cantidad !== undefined && producto.cantidad >= 0) {
          // Agregar la operación de edición al array
          const edicion = this.firebaseService.editar('productosMalEstado', producto);
          operaciones.push(edicion);
        }
        // Restablecer propiedades
        producto.existencia = false;
        producto.modificado = false;
      }
    });
  
    // Ejecutar todas las operaciones y mostrar una sola alerta si todo sale bien
    Promise.all(operaciones)
      .then(() => {
        alertExito(
          'Operación Exitosa',
          'Todos los cambios se han guardado correctamente.',
          this.router,
          '/menu-administrativo'
        );
      })
      .catch(error => {
        console.error('Error en las operaciones:', error);
      });
  }
  
  validarCantidad(producto: any): void {
    if (producto.cantidad < 0) {
      producto.cantidad = 0; // Ajusta a cero si el valor es negativo
    }
    producto.modificado = true; // Marcar como modificado
  }
  
  actualizarEstado(producto: any, campo: 'existencia' | 'vendido'): void {
    if (campo === 'existencia' && producto.existencia) {
      producto.vendido = false; 
    } else if (campo === 'vendido' && producto.vendido) {
      producto.existencia = false; 
    }
    producto.modificado = true; // Marcar como modificado
  }

  regresar(): void {
    this.router.navigate(['/menu-administrativo']);
  }
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  scrollToBottom(): void {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }
  
}
