import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseRealTimeDatabaseService } from '../../../../services/firebase-Realtime-Database.service';
import { alertResultado, alertEliminar } from '../../../../services/utils';
import { NavbarComponent } from '../navbar/navbar.component';
import { firstValueFrom } from 'rxjs';

declare var $: any;

@Component({
  selector: 'app-controlcontable',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './controlcontable.component.html'
})
export class ControlcontableComponent implements OnInit {

  carpeta = 'controlContable';

  contenedor: any[] = [];
  contenedorFiltrado: any[] = [];
  mostrarFiltrosMovil = false;
  mostrarFormulario = false;
  editando = false;

  // Para editar correctamente
  id: string | null = null;

  tipo = 'entrada';
  fecha = '';
  concepto = '';
  persona = '';
  monto: number | null = null;
  observacion = '';

  totalEntradas = 0;
  totalSalidas = 0;
  balance = 0;
  totalMovimientos = 0;

  filtroTipo = '';
  filtroPersona = '';
  fechaInicio = '';
  fechaFin = '';

  constructor(private firebaseService: FirebaseRealTimeDatabaseService) { }

  ngOnInit(): void {
    this.listar();
  }

  listar() {
    this.firebaseService.listado(this.carpeta).subscribe(data => {
      this.contenedor = data;
      this.contenedorFiltrado = data;
      this.calcularIndicadores();
    });
  }

  aplicarFiltros() {
    this.contenedorFiltrado = this.contenedor.filter(r => {
      return (
        (!this.filtroTipo || r.tipo === this.filtroTipo) &&
        (!this.filtroPersona || r.persona.toLowerCase().includes(this.filtroPersona.toLowerCase())) &&
        (!this.fechaInicio || r.fecha >= this.fechaInicio) &&
        (!this.fechaFin || r.fecha <= this.fechaFin)
      );
    });

    this.calcularIndicadores();
  }

  calcularIndicadores() {
    this.totalEntradas = 0;
    this.totalSalidas = 0;

    this.contenedorFiltrado.forEach(r => {
      if (r.tipo === 'entrada') this.totalEntradas += Number(r.monto);
      else this.totalSalidas += Number(r.monto);
    });

    this.balance = this.totalEntradas - this.totalSalidas;
    this.totalMovimientos = this.contenedorFiltrado.length;
  }

  nuevo() {
    this.mostrarFormulario = true;
    this.limpiarFormulario();
  }

  guardar() {
    if (!this.concepto || this.monto === null) {
      alert('Debe completar Concepto y Monto');
      return;
    }

    const datos: any = {
      tipo: this.tipo,
      fecha: this.fecha || new Date().toISOString().substring(0, 10),
      concepto: this.concepto,
      persona: this.persona,
      monto: this.monto,
      observacion: this.observacion || ''
    };

    if (this.editando && this.id) {
      // Incluir el id dentro del objeto datos
      datos.id = this.id;

      alertResultado(
        'editar',
        this.concepto,
        () => this.firebaseService.editar(this.carpeta, datos),
        '/controlcontable'
      );
    } else {
      alertResultado(
        'crear',
        this.concepto,
        () => this.firebaseService.insertar(this.carpeta, datos),
        '/controlcontable'
      );
    }

    this.mostrarFormulario = false;
    this.limpiarFormulario();
    this.listar();
  }

  editar(r: any) {
    this.editando = true;
    this.mostrarFormulario = true;

    // Guardamos el id del registro a editar
    this.id = r.id;

    // Asignamos los datos al formulario
    this.tipo = r.tipo;
    this.fecha = r.fecha;
    this.concepto = r.concepto;
    this.persona = r.persona;
    this.monto = r.monto;
    this.observacion = r.observacion || '';
  }

  eliminar(id: string, concepto: string) {
    alertEliminar(
      () => this.firebaseService.eliminar(id, this.carpeta),
      concepto,
      '/controlcontable'
    );
  }

  cancelar() {
    this.mostrarFormulario = false;
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.editando = false;
    this.id = null;
    this.tipo = 'entrada';
    this.fecha = '';
    this.concepto = '';
    this.persona = '';
    this.monto = null;
    this.observacion = '';
  }
}
