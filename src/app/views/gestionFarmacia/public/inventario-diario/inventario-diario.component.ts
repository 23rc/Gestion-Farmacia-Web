import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseRealTimeDatabaseService } from '../../../../services/firebase-Realtime-Database.service';
import { Router } from '@angular/router';
import { SesionService } from '../../../../services/sesion.service';
import {

  alertExito,
  alertError,
  alertEliminar

} from '../../../../services/utils';

@Component({
  selector: 'app-inventario-diario',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './inventario-diario.component.html',
  styleUrl: './inventario-diario.component.css'
})
export class InventarioDiarioComponent implements OnInit {
  FiltroRevisor: string = 'TODOS';
  NombreUsuario: string = '';
  rol: string = '';
  usuarioActivo: any = null;
  FiltroFechaInicio: string = '';
  FiltroFechaFin: string = '';
  FiltroEstado: string = 'TODOS';
  MostrarListadoMovil: boolean = false;
  RegistroAbierto: string = '';
  Carpeta: string = "InventarioDiario";

  Inventario: any[] = [];
  InventarioFiltrado: any[] = [];

  Editando: boolean = false;

  // =========================
  // ID FIREBASE
  // =========================

  Id: string = '';

  // =========================
  // DATOS INVENTARIO
  // =========================

  Fecha: string = '';

  CodigoProducto: string = '';

  NombreProducto: string = '';

  Cantidad: number | null = null;

  Tipo: string = 'FALTANTE';

  Estado: string = 'PENDIENTE';

  // =========================
  // DATOS CRUCE
  // =========================

  TieneCruce: boolean = false;

  CodigoCruce: string = '';

  NombreCruce: string = '';

  CantidadCruce: number | null = null;

  TipoCruce: string = 'SOBRANTE';

  constructor(
    private sesion: SesionService,
    private FirebaseRealtimeDatabaseService: FirebaseRealTimeDatabaseService,
    private router: Router

  ) { }

  ngOnInit(): void {

    const usuario = this.sesion.getUsuario();

    if (!usuario) {

      this.router.navigate(['/menu']);
      return;

    }

    this.usuarioActivo = usuario;

    this.rol = this.sesion.getRol();

    this.NombreUsuario = this.sesion.getNombre();

    this.ObtenerInventario();
  }
  private obtenerFechaHoy(): string {
    const hoy = new Date();

    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
  FiltrarEstado(estado: string) {
    this.FiltroEstado = estado;

    if (estado === 'TODOS') {
      this.FiltroFechaInicio = '';
      this.FiltroFechaFin = '';
    }

    this.AplicarFiltros();
  }

  AplicarFiltros() {

    const inicio = this.FiltroFechaInicio
      ? new Date(this.FiltroFechaInicio + "T00:00:00")
      : null;

    const fin = this.FiltroFechaFin
      ? new Date(this.FiltroFechaFin + "T23:59:59")
      : null;

    const usuario = this.sesion.getUsuario();
    const rol = usuario?.rol;


    this.InventarioFiltrado = this.Inventario.filter(x => {

      const fecha = new Date(x.fecha + "T00:00:00");

      const cumpleEstado =
        this.FiltroEstado === 'TODOS' || x.estado === this.FiltroEstado;

      const cumpleFecha =
        (!inicio || fecha >= inicio) &&
        (!fin || fecha <= fin);

      const cumpleAcceso =
        rol === 'ENCARGADO' || rol === 'SUB_ENCARGADO'
          ? true
          : x.codigoUsuario === usuario.usuario;

      const cumpleRevisor =
        !this.FiltroRevisor ||
        this.FiltroRevisor === 'TODOS' ||
        x.nombreUsuario === this.FiltroRevisor;

      return cumpleEstado && cumpleFecha && cumpleAcceso && cumpleRevisor;
    });

    // 👇 DEPURACIÓN

  }
  ToggleRegistro(Id: string) {

    if (this.RegistroAbierto == Id) {

      this.RegistroAbierto = '';

    }

    else {

      this.RegistroAbierto = Id;

    }

  }
  MostrarListado() {

    this.MostrarListadoMovil = true;

  }

  MostrarFormulario() {

    this.MostrarListadoMovil = false;

  }
  // =========================
  // LISTAR
  // =========================

  ObtenerInventario() {

    this.FirebaseRealtimeDatabaseService
      .listado(this.Carpeta)
      .subscribe((Respuesta) => {

        this.Inventario = Respuesta.sort((A: any, B: any) => {

          // ORDENAR POR FECHA DESCENDENTE
          const fechaA = new Date(A.fecha).getTime();
          const fechaB = new Date(B.fecha).getTime();

          return fechaB - fechaA;

        });

        this.AplicarFiltros();

      });

  }

  // =========================
  // GUARDAR
  // =========================

  Guardar() {

    // =========================
    // VALIDACIONES
    // =========================

    if (this.Fecha == '') {

      alertError("Ingrese fecha");
      return;

    }

    // =========================
    // NUEVO: SIN INCIDENCIA SALTA VALIDACIONES DE PRODUCTO
    // =========================

    if (this.Tipo !== 'SIN_INCIDENCIA') {

      if (this.CodigoProducto == '') {

        alertError("Ingrese código producto");
        return;

      }

      if (this.NombreProducto == '') {

        alertError("Ingrese nombre producto");
        return;

      }

      if (!this.Cantidad || this.Cantidad <= 0) {

        alertError("Ingrese una cantidad válida");
        return;

      }

    }

    // =========================
    // VALIDAR CRUCE (SE MANTIENE IGUAL)
    // =========================

    if (this.TieneCruce) {

      if (this.CodigoCruce == '') {

        alertError("Ingrese código cruce");
        return;

      }

      if (this.NombreCruce == '') {

        alertError("Ingrese nombre cruce");
        return;

      }

      if (!this.CantidadCruce || this.CantidadCruce <= 0) {

        alertError("Ingrese una cantidad cruce válida");
        return;

      }

    }

    // =========================
    // LIMPIAR DATOS CRUCE
    // =========================

    if (!this.TieneCruce) {

      this.CodigoCruce = '';

      this.NombreCruce = '';

      this.CantidadCruce = 0;

      this.TipoCruce = 'SOBRANTE';

    }

    // =========================
    // INSERTAR
    // =========================

    if (!this.Editando) {
      const usuario = this.sesion.getUsuario();

      const Datos = {

        fecha: this.Fecha,

        codigoProducto: this.Tipo === 'SIN_INCIDENCIA'
          ? '0'
          : String(this.CodigoProducto || '').toUpperCase(),

        nombreProducto: this.Tipo === 'SIN_INCIDENCIA'
          ? 'SIN INCIDENCIAS - TODO OK'
          : this.NombreProducto.toUpperCase(),

        cantidad: this.Tipo === 'SIN_INCIDENCIA'
          ? 0
          : this.Cantidad,

        tipo: this.Tipo,

        estado: this.Tipo === 'SIN_INCIDENCIA'
          ? 'SOLUCIONADO'
          : this.Estado,

        tieneCruce: this.TieneCruce,

        codigoCruce: String(this.CodigoCruce || '').toUpperCase(),

        nombreCruce: this.NombreCruce.toUpperCase(),

        cantidadCruce: this.CantidadCruce,

        tipoCruce: this.TipoCruce,

        codigoUsuario: usuario.usuario,

        nombreUsuario: usuario.nombre,

        revisa_a: usuario.revisa_a,

        fechaCreacion: Date.now()

      };

      this.FirebaseRealtimeDatabaseService
        .insertar(this.Carpeta, Datos)
        .then(() => {

          alertExito(
            "Registro agregado",
            `${this.NombreProducto} agregado correctamente`,
            this.router,
            '/inventario-diario'
          );

          this.LimpiarFormulario();

        })
        .catch(() => {

          alertError("Error al guardar registro");

        });

    }

    // =========================
    // EDITAR
    // =========================

    else {
      const usuario = this.sesion.getUsuario();

      const Datos = {

        id: this.Id,

        fecha: this.Fecha,

        codigoProducto: String(this.CodigoProducto || '').toUpperCase(),

        nombreProducto: this.NombreProducto.toUpperCase(),

        cantidad: this.Cantidad,

        tipo: this.Tipo,

        estado: this.Estado,

        tieneCruce: this.TieneCruce,

        codigoCruce: String(this.CodigoCruce || '').toUpperCase(),

        nombreCruce: this.NombreCruce.toUpperCase(),

        cantidadCruce: this.CantidadCruce,

        tipoCruce: this.TipoCruce,

        codigoUsuario: usuario.usuario,

        nombreUsuario: usuario.nombre,

        revisa_a: usuario.revisa_a,

        fechaCreacion: Date.now()

      };

      this.FirebaseRealtimeDatabaseService
        .editar(this.Carpeta, Datos)
        .then(() => {

          alertExito(
            "Registro actualizado",
            `${this.NombreProducto} actualizado correctamente`,
            this.router,
            '/inventario-diario'
          );

          this.LimpiarFormulario();

        })
        .catch(() => {

          alertError("Error al actualizar registro");

        });

    }

  }

  // =========================
  // EDITAR REGISTRO
  // =========================

  EditarRegistro(Item: any) {
    this.MostrarListadoMovil = false;
    this.Editando = true;

    this.Id = Item.id;

    this.Fecha = Item.fecha;

    this.CodigoProducto = Item.codigoProducto;

    this.NombreProducto = Item.nombreProducto;

    this.Cantidad = Item.cantidad;

    this.Tipo = Item.tipo;

    this.Estado = Item.estado;

    this.TieneCruce = Item.tieneCruce;

    this.CodigoCruce = Item.codigoCruce;

    this.NombreCruce = Item.nombreCruce;

    this.CantidadCruce = Item.cantidadCruce;

    this.TipoCruce = Item.tipoCruce;

  }

  // =========================
  // CAMBIAR ESTADO
  // =========================

  CambiarEstado(Item: any, EstadoNuevo: string) {

    // =========================
    // 🔒 VALIDACIÓN DE PERMISOS
    // =========================
    if (!this.esEncargado()) {

      alertError(
        "Solo el encargado puede cambiar el estado del registro"
      );

      return;

    }

    // =========================
    // ACTUALIZACIÓN
    // =========================

    const Datos = {

      id: Item.id,

      fecha: Item.fecha,

      codigoProducto: Item.codigoProducto,

      nombreProducto: Item.nombreProducto,

      cantidad: Item.cantidad,

      tipo: Item.tipo,

      estado: EstadoNuevo,

      tieneCruce: Item.tieneCruce,

      codigoCruce: Item.codigoCruce,

      nombreCruce: Item.nombreCruce,

      cantidadCruce: Item.cantidadCruce,

      tipoCruce: Item.tipoCruce,

      fechaCreacion: Item.fechaCreacion

    };

    this.FirebaseRealtimeDatabaseService
      .editar(this.Carpeta, Datos)
      .then(() => {

        alertExito(
          "Estado actualizado",
          `Registro cambiado a ${EstadoNuevo}`,
          this.router,
          '/inventario-diario'
        );

      })
      .catch(() => {

        alertError("Error al actualizar estado");

      });

  }

  // =========================
  // ELIMINAR
  // =========================

  EliminarRegistro(Id: string, NombreProducto: string) {

    alertEliminar(

      () => this.FirebaseRealtimeDatabaseService
        .eliminar(Id, this.Carpeta),

      NombreProducto,

      '/inventario-diario'

    );

  }

  // =========================
  // LIMPIAR FORMULARIO
  // =========================

  LimpiarFormulario() {

    this.Editando = false;

    this.Id = '';

    this.Fecha = '';

    this.CodigoProducto = '';

    this.NombreProducto = '';

    this.Cantidad = null;

    this.Tipo = 'FALTANTE';

    this.Estado = 'PENDIENTE';

    this.TieneCruce = false;

    this.CodigoCruce = '';

    this.NombreCruce = '';

    this.CantidadCruce = 0;

    this.TipoCruce = 'SOBRANTE';

  }
  EsNuevaFecha(index: number): boolean {

    // PRIMER REGISTRO
    if (index === 0) {
      return true;
    }

    const fechaActual =
      this.InventarioFiltrado[index]?.fecha;

    const fechaAnterior =
      this.InventarioFiltrado[index - 1]?.fecha;

    // SOLO COMPARA FECHAS
    return fechaActual !== fechaAnterior;

  }
  esEncargado(): boolean {

    const rol = this.sesion.getRol();

    return rol === 'ENCARGADO' || rol === 'SUB_ENCARGADO';

  }
  CerrarSesion() {

    this.sesion.logout();

    this.router.navigate(['/menu']);

  }
}
