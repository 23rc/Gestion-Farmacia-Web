import { Component,OnInit } from '@angular/core';
import { FirebaseRealTimeDatabaseService } from '../../../../../services/firebase-Realtime-Database.service'; 
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
declare var $: any; 
import { alertEliminar } from '../../../../../services/utils';
import { NavbarComponent } from '../../navbar/navbar.component';

@Component({
  selector: 'app-lista-cliente-plan-medico',
  standalone: true,
  imports: [FormsModule, CommonModule,NavbarComponent],
  templateUrl: './lista-cliente-plan-medico.component.html',
  styleUrl: './lista-cliente-plan-medico.component.css'
})
export class ListaClientePlanMedicoComponent implements OnInit{
  contenedor: any[] = [];

  constructor(private firebaseService: FirebaseRealTimeDatabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const carpeta = "clientesPlanMedico"
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
    this.router.navigate(['/editar-cliente-plan-medico', id]); 
  }
  eliminar(id: string, nombreMedicamento: string) {
    const rutaRedireccion = '/lista-cliente-plan-medico';
    const carpeta = "clientesPlanMedico"
    alertEliminar(() => this.firebaseService.eliminar(id,carpeta), nombreMedicamento,rutaRedireccion);
  }
  agregar() {
    this.router.navigate(['/crear-cliente-plan-medico']); 
  }
  regresar() {
    this.router.navigate(['/menu-administrativo']);
  }
}
