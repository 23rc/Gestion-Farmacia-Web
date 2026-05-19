import { Component,OnInit } from '@angular/core';
import { FirebaseRealTimeDatabaseService } from '../../../../../services/firebase-Realtime-Database.service'; 
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
declare var $: any; 
import { alertEliminar } from '../../../../../services/utils';

@Component({
  selector: 'app-cliente-plan-medico',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './cliente-plan-medico.component.html',
  styleUrl: './cliente-plan-medico.component.css'
})
export class ClientePlanMedicoComponent implements OnInit {
  contenedor: any[] = [];
  filtro: string = ''; 
  mensajeVisible: boolean = false;

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
  copiar(dato: string): void {
    navigator.clipboard.writeText(dato).then(() => {
      this.mensajeVisible = true; // Mostrar el mensaje
      setTimeout(() => {
        this.mensajeVisible = false; // Ocultar el mensaje después de 2 segundos
      }, 2000);
    }).catch(() => {
      alert('Hubo un error al copiar el dato.');
    });
  }
  
    // Método para filtrar los datos
    filtrarDatos(): any[] {
      if (!this.filtro.trim()) {
        return this.contenedor; // Si no hay filtro, se muestran todos los datos
      }
      const texto = this.filtro.toLowerCase();
      return this.contenedor.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(texto)
        )
      );
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
    this.router.navigate(['/menu']);
  }
}
