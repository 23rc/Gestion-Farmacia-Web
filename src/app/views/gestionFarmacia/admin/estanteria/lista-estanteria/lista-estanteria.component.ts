import { Component,OnInit } from '@angular/core';
import { FirebaseRealTimeDatabaseService } from '../../../../../services/firebase-Realtime-Database.service'; 
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
declare var $: any; 
import { alertEliminar } from '../../../../../services/utils';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-lista-estanteria',
  standalone: true,
  imports: [FormsModule, CommonModule,NavbarComponent],
  templateUrl: './lista-estanteria.component.html',
  styleUrl: './lista-estanteria.component.css'
})
export class ListaEstanteriaComponent implements OnInit {

  contenedor: any[] = [];

  constructor(private firebaseService: FirebaseRealTimeDatabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const carpeta = "estanterias"
    this.firebaseService.listado(carpeta).subscribe((contenedor) => {
    this.contenedor = contenedor;
      setTimeout(() => {
        if ($.fn.DataTable.isDataTable('#tabla')) {
          $('#tabla').DataTable().destroy();
        }
        $('#tabla').DataTable({
          language: {
            url: 'https://cdn.datatables.net/plug-ins/2.1.8/i18n/es-MX.json'
          }
        });
      }, 0);
    });
  }
  editarProducto(id: string) {
    this.router.navigate(['/editar-estanteria', id]); 
  }
  eliminar(id: string, nombreEstanteria: string) {
    const rutaRedireccion = '/lista-estanteria';
    const carpeta = "estanterias"
    alertEliminar(() => this.firebaseService.eliminar(id, carpeta), nombreEstanteria,rutaRedireccion);
  }
  agregar() {
    this.router.navigate(['/crear-estanteria']); 
  }
  regresar() {
    this.router.navigate(['/menu-administrativo']);
  }
}
