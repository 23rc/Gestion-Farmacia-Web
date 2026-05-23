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

  MostrarModalSinExistencia: boolean = false;
  public listaProductos: Array<{ codigo: string, nombre: string }> = [{ codigo: '', nombre: '' }];
  public DatosModalSinExistencia: string = '';
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
  // DATOS PRODUCTOS SIN EXISTENCIA (NUEVO)
  // =========================
  // DATOS PRODUCTOS SIN EXISTENCIA
  TieneSinExistencia: boolean = false;
  ColumnaCodigos: string = '';  // Lo que escribes en la izquierda
  ColumnaNombres: string = '';  // Lo que escribes en la derecha
  ListadoSinExistencia: string = ''; // Aquí se arma el texto final ordenado
  EstadoSinExistencia: string = 'PENDIENTE_AGREGAR';
  public ItemActual: any = null;


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

      // const cumpleEstado =
      //   this.FiltroEstado === 'TODOS' || x.estado === this.FiltroEstado;
      const cumpleEstado = this.FiltroEstado === 'TODOS'
        || (this.FiltroEstado === 'PENDIENTE' && (x.estado === 'PENDIENTE' || x.estadoSinExistencia === 'PENDIENTE_AGREGAR'))
        || (this.FiltroEstado === 'SOLUCIONADO' && x.estado === 'SOLUCIONADO' && (!x.tieneSinExistencia || x.estadoSinExistencia === 'AGREGADO'));

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
    // VALIDAR CRUCE
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
    // LIMPIAR DATOS CRUCE SI NO SE USA
    // =========================

    if (!this.TieneCruce) {
      this.CodigoCruce = '';
      this.NombreCruce = '';
      this.CantidadCruce = 0;
      this.TipoCruce = 'SOBRANTE';
    }

    // =========================
    // PROCESAR LISTADO SIN EXISTENCIA (TAL CUAL LO HICIMOS)
    // =========================
    if (this.TieneSinExistencia) {
      let textoOrganizado = '';
      this.listaProductos.forEach(item => {
        const cod = (item.codigo || '').trim();
        const nom = (item.nombre || '').trim();
        if (cod !== '' && nom !== '') {
          textoOrganizado += cod.padEnd(15, ' ') + nom + '\n';
        }
      });
      this.ListadoSinExistencia = textoOrganizado.trim();
      if (this.ListadoSinExistencia === '') {
        alertError("Activó 'Sin Existencia' pero no ingresó ningún producto");
        return;
      }
    } else {
      this.ListadoSinExistencia = '';
    }

    // =========================
    // INSERTAR
    // =========================

    if (!this.Editando) {
      const usuario = this.sesion.getUsuario();

      const Datos = {
        fecha: this.Fecha,
        codigoProducto: this.Tipo === 'SIN_INCIDENCIA' ? '0' : String(this.CodigoProducto || '').toUpperCase(),
        nombreProducto: this.Tipo === 'SIN_INCIDENCIA' ? 'SIN INCIDENCIAS - TODO OK' : this.NombreProducto.toUpperCase(),
        cantidad: this.Tipo === 'SIN_INCIDENCIA' ? 0 : this.Cantidad,
        tipo: this.Tipo,
        estado: this.Tipo === 'SIN_INCIDENCIA' ? 'SOLUCIONADO' : this.Estado,

        tieneCruce: this.TieneCruce,
        codigoCruce: String(this.CodigoCruce || '').toUpperCase(),
        nombreCruce: this.NombreCruce.toUpperCase(),
        cantidadCruce: this.CantidadCruce,
        tipoCruce: this.TipoCruce,

        tieneSinExistencia: this.TieneSinExistencia,
        listadoSinExistencia: this.ListadoSinExistencia,
        estadoSinExistencia: this.TieneSinExistencia ? this.EstadoSinExistencia : null,
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
      const RegistroOriginal = this.Inventario.find(x => x.id === this.Id);
      let nuevoEstadoSinExistencia = this.EstadoSinExistencia;

      if (
        RegistroOriginal &&
        RegistroOriginal.tieneSinExistencia &&
        this.TieneSinExistencia &&
        RegistroOriginal.estadoSinExistencia === 'AGREGADO' &&
        RegistroOriginal.listadoSinExistencia !== this.ListadoSinExistencia
      ) {
        nuevoEstadoSinExistencia = 'PENDIENTE_AGREGAR';
      }

      const Datos = {
        id: this.Id,
        fecha: this.Fecha,
        codigoProducto: String(this.CodigoProducto || '').toUpperCase(),
        nombreProducto: this.NombreProducto.toUpperCase(),
        cantidad: this.Cantidad,
        tipo: this.Tipo,
        estado: this.Estado,

        // 🔴 ASEGURAMOS QUE SE GUARDE EL ESTADO DEL CRUCE
        tieneCruce: this.TieneCruce,
        codigoCruce: String(this.CodigoCruce || '').toUpperCase(),
        nombreCruce: this.NombreCruce.toUpperCase(),
        cantidadCruce: this.CantidadCruce,
        tipoCruce: this.TipoCruce,

        // ✅ ASEGURAMOS QUE SE GUARDE LO DE SIN EXISTENCIA
        tieneSinExistencia: this.TieneSinExistencia,
        listadoSinExistencia: this.ListadoSinExistencia,
        estadoSinExistencia: this.TieneSinExistencia ? nuevoEstadoSinExistencia : null,


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
  // EDITAR REGISTRO (VERSIÓN FINAL - TODO INTEGRADO)
  // =========================

  // =========================
  // EDITAR REGISTRO
  // =========================

  // =========================
  // EDITAR REGISTRO (CORREGIDA AL 100% PARA QUE SE VEA EL CRUCE)
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

    // 🔴🔴🔴 AQUÍ ESTABA EL ERROR PRINCIPAL 🔴🔴🔴
    // Antes solo leías la variable, ahora FORZAMOS que si hay datos, se active SIEMPRE
    this.TieneCruce = false; // Lo apagamos de inicio

    // Si la base dice que tiene cruce, O si hay algo escrito en los campos, lo activamos
    if (Item.tieneCruce === true || Item.codigoCruce || Item.nombreCruce || Item.cantidadCruce) {
      this.TieneCruce = true; // ✅ SWITCH PRENDIDO
    }

    // ✅ AHORA SÍ CARGAMOS LOS DATOS (ya no estarán ocultos)
    this.CodigoCruce = Item.codigoCruce || '';
    this.NombreCruce = Item.nombreCruce || '';
    this.CantidadCruce = Item.cantidadCruce || null;
    this.TipoCruce = Item.tipoCruce || 'SOBRANTE';

    // ======================================
    // ✅ LO DE PRODUCTOS SIN EXISTENCIA (CORREGIDO)
    // ======================================
    const valorSinExistencia = Item.tieneSinExistencia;
    this.TieneSinExistencia = (valorSinExistencia === true || valorSinExistencia === "true" || valorSinExistencia === 1);
    this.EstadoSinExistencia = Item.estadoSinExistencia || 'PENDIENTE_AGREGAR';
    this.ListadoSinExistencia = Item.listadoSinExistencia || '';

    // 🔴🔴🔴 AQUÍ EL CAMBIO IMPORTANTE 🔴🔴🔴
    // Ya NO inicializamos lista vacía al inicio.
    // Solo creamos lista vacía si NO hay datos guardados.
    if (this.TieneSinExistencia && this.ListadoSinExistencia) {
      // Si hay datos guardados: LOS LEEMOS Y ARMAMOS LA LISTA
      const lineas = this.ListadoSinExistencia.split('\n');
      this.listaProductos = lineas.map(linea => {
        const cod = linea.substring(0, 15).trim();
        const nom = linea.substring(15).trim();
        return { codigo: cod, nombre: nom };
      });
    } else {
      // Si NO hay datos: DEJAMOS UNA FILA VACÍA
      this.listaProductos = [{ codigo: '', nombre: '' }];
    }
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

    this.TieneSinExistencia = false;
    this.ColumnaCodigos = '';
    this.ColumnaNombres = '';
    this.ListadoSinExistencia = '';
    this.EstadoSinExistencia = 'PENDIENTE_AGREGAR';
    this.listaProductos = [{ codigo: '', nombre: '' }];

  }
  VerSinExistencia(Item: any) {
    this.ItemActual = Item;
    this.DatosModalSinExistencia = Item.listadoSinExistencia || 'Sin datos guardados';
    this.MostrarModalSinExistencia = true;
  }



  CerrarModal() {
    this.MostrarModalSinExistencia = false;
    this.ItemActual = null;
    this.DatosModalSinExistencia = ''; // Esto se limpia al cerrar, es correcto
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

  // 1. SALTO DE CÓDIGO A NOMBRE (Valida que haya código)
  irANombre(indice: number, event: Event): void {
    event.preventDefault();

    // 🛑 OBLIGATORIO: CÓDIGO NO VACÍO
    const codigoEscrito = (this.listaProductos[indice].codigo || '').trim();

    if (codigoEscrito === '') {
      alertError('Escribe primero el CÓDIGO');
      return;
    }

    // ✅ Si tiene código, pasa al nombre
    setTimeout(() => {
      const nombres = document.querySelectorAll('input[placeholder="Nombre del producto"]');
      if (nombres[indice]) (nombres[indice] as HTMLInputElement).focus();
    }, 10);
  }

  // 2. AL PRESIONAR ENTER EN NOMBRE: AHORA VALIDA LOS DOS CAMPOS
  agregarNuevoRegistro(event: Event, indiceActual: number): void {
    event.preventDefault();

    // 🛑 PRIMERO: VALIDAMOS QUE EXISTA EL CÓDIGO
    const codigoEscrito = (this.listaProductos[indiceActual].codigo || '').trim();
    if (codigoEscrito === '') {
      alertError('Falta el CÓDIGO');
      return;
    }

    // 🛑 SEGUNDO: VALIDAMOS QUE TAMBIÉN ESCRIBA EL NOMBRE ✅ (ESTA ES LA PARTE NUEVA)
    const nombreEscrito = (this.listaProductos[indiceActual].nombre || '').trim();
    if (nombreEscrito === '') {
      alertError('Escribe el NOMBRE del producto');
      return; // ❌ NO CREA LA LÍNEA SI NO HAY NOMBRE
    }

    // ✅ SI LLEGA AQUÍ: AMBOS ESTÁN LLENOS, GUARDAMOS Y CONTINUAMOS
    this.actualizarDatosParaModal();

    // ✅ CREAMOS LA NUEVA LÍNEA SOLO SI TODO ESTÁ COMPLETO
    this.listaProductos.push({ codigo: '', nombre: '' });

    // ✅ BAJA SCROLL Y ENVÍA FOCO AL NUEVO CÓDIGO
    setTimeout(() => {
      const contenedor = document.querySelector('.overflow-y-auto');
      if (contenedor) contenedor.scrollTop = contenedor.scrollHeight;

      const codigos = document.querySelectorAll('input[placeholder="Código"]');
      if (codigos[indiceActual + 1]) (codigos[indiceActual + 1] as HTMLInputElement).focus();
    }, 10);
  }

  // 3. ELIMINAR FILA
  eliminarFila(indice: number): void {
    if (this.listaProductos.length > 1) {
      this.listaProductos.splice(indice, 1);
    } else {
      this.listaProductos[0].codigo = '';
      this.listaProductos[0].nombre = '';
    }
    this.actualizarDatosParaModal();
  }

  // 4. FUNCIÓN PARA EL MODAL
  actualizarDatosParaModal(): void {
    let textoFinal = '';

    this.listaProductos.forEach(item => {
      const cod = (item.codigo || '').trim();
      const nom = (item.nombre || '').trim();

      // Solo guarda registros que tengan AMBAS cosas
      if (cod !== '' && nom !== '') {
        textoFinal += `${cod.padEnd(15)} ${nom}\n`;
      }
    });

    this.DatosModalSinExistencia = textoFinal.trim();
  }
  // ✅ NUEVA FUNCIÓN: CAMBIA EL ESTADO EN BD
  MarcarComoAgregado() {

    if (!this.esEncargado()) {
      alertError(
        "Solo el encargado puede marcar productos como AGREGADOS"
      );
      return;
    }

    if (!this.ItemActual) return;
    const Datos = { ...this.ItemActual, estadoSinExistencia: 'AGREGADO' };
    this.FirebaseRealtimeDatabaseService.editar(this.Carpeta, Datos)
      .then(() => {
        alertExito(
          "Actualizado",
          "Productos marcados como AGREGADOS al sistema",
          this.router,
          '/inventario-diario'
        );
        this.CerrarModal();
      })
      .catch(() => {
        alertError("Error al actualizar el estado");
      });
  }


}
