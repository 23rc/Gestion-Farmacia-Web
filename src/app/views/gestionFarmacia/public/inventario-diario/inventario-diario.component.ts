import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseRealTimeDatabaseService } from '../../../../services/firebase-Realtime-Database.service';
import { Router } from '@angular/router';
import { SesionService } from '../../../../services/sesion.service';
import { environment } from '../../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import {

  alertExito,
  alertError,
  alertEliminar,
  alertEliminarSinRedirigir,
  alertExitoSinRedirigir

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
  public ListaUsuarios = environment.usuarios;
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



  // Variables
  MostrarModalImpulsos = false;
  abrirFormulario = false;
  Impulsos: any[] = [];

  codigo = '';
  nombre = '';
  cantidad: number | null = null;
  fechaVenc = '';
  // Variables nuevas
  productoSeleccionado: any = '';
  cantidadDisponible = 0;
  usuarioDestino = '';
  cantidadAsignar: number | null = null;
  asignaciones: any[] = [];
  filtroUsuario = '';
  // Nuevas variables
  filtroMedicamento = '';
  asignacionesFiltradas: any[] = [];

  // Variables para ventas
  // --- VARIABLES ACTUALIZADAS ---
  modalVentaAbierto = false;
  prodSeleccionado: any = {};
  noFactura = '';
  cantidadVender: number | null = null;
  ventasDelProducto: any[] = [];
  // --- NUEVAS VARIABLES PARA VENTAS DE AYUDA ---
  // --- NUEVAS VARIABLES ---
  mostrarAyuda = false;
  listaOtrasAsignaciones: any[] = [];
  asignacionAyudaSeleccionada: any = null;
  // --- VARIABLES QUE YA USAS ---
  productoEditar: any = null;
  cantidadNuevasAsignaciones = 0;
  modalHistorialAbierto = false;
  // Variable para controlar el despliegue de la tabla
tablaInventarioAbierta = false;



modoAyudaGeneral = false;
usuarioAyudaSeleccionado: string | null = null;







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





  // // Llamar al abrir el modal
  // AbrirModalImpulsos() {
  //   this.MostrarModalImpulsos = true;
  //   this.cargarAsignaciones(); // Carga siempre para todos
  //   if (this.esEncargado()) this.cargarProductos(); // Solo encargado carga globales
  // }


  // cargarProductos() {
  //   this.FirebaseRealtimeDatabaseService.listado("Impulsos")
  //     .subscribe(res => this.Impulsos = res || []);
  // }

  // guardarProducto() {
  //   if (!this.esEncargado() || !this.codigo || !this.nombre || !this.cantidad || !this.fechaVenc) {
  //     return alertError("Complete todos los campos");
  //   }

  //   const datos = {
  //     codigo: this.codigo.toUpperCase(),
  //     nombre: this.nombre.toUpperCase(),
  //     cantidadTotal: this.cantidad,
  //     fechaVencimiento: this.fechaVenc,
  //     fechaCreacion: Date.now()
  //   };

  //   this.FirebaseRealtimeDatabaseService.insertar("Impulsos", datos)
  //     .then(() => {
  //       alertExito("Guardado", "Producto creado", this.router, '/inventario-diario');
  //       this.abrirFormulario = false;
  //       this.codigo = this.nombre = this.fechaVenc = '';
  //       this.cantidad = null;
  //       this.cargarProductos();
  //     })
  //     .catch(() => alertError("Error al guardar"));
  // }

// ✅ TU FUNCIÓN ORIGINAL SIGUE INTACTA
calcularDisponible() {
  if (!this.productoSeleccionado) {
    this.cantidadDisponible = 0;
    return;
  }
  this.FirebaseRealtimeDatabaseService.listado("AsignacionesImpulso").subscribe(asignadas => {
    const yaAsignado = asignadas
      .filter((a: any) => a.idImpulso === this.productoSeleccionado.id)
      .reduce((suma: number, a: any) => suma + a.cantidadAsignada, 0);

    this.cantidadDisponible = this.productoSeleccionado.cantidadTotal - yaAsignado;
  });
}

// ✅ NUEVA: Vendido Global
calcularVendidoGlobal(producto: any): number {
  if (!producto?.id || !this.asignaciones.length) return 0;
  return this.asignaciones
    .filter(asig => asig.idImpulso === producto.id)
    .reduce((total, asig) => total + (asig.vendido || 0), 0);
}

// ✅ NUEVA: Disponible para Venta
calcularDisponibleVenta(producto: any): number {
  if (!producto?.cantidadTotal) return 0;
  return producto.cantidadTotal - this.calcularVendidoGlobal(producto);
}

// ✅ NUEVA: Disponible para Reparto (igual lógica que tu función original, para el select)
calcularDisponibleReparto(producto: any): number {
  if (!producto?.id) return 0;
  const yaAsignado = this.asignaciones
    .filter(asig => asig.idImpulso === producto.id)
    .reduce((suma, asig) => suma + (asig.cantidadAsignada || 0), 0);
  return producto.cantidadTotal - yaAsignado;
}
// ✅ Devuelve el Total General del producto
obtenerTotalProducto(producto: any): number {
  return producto?.cantidadTotal || 0;
}



  // Asignar con control de cantidad
  asignarProducto() {
    if (!this.productoSeleccionado || !this.usuarioDestino || !this.cantidadAsignar) {
      return alertError("Completa todos los datos");
    }

    if (this.cantidadAsignar > this.cantidadDisponible) {
      return alertError(`Solo quedan ${this.cantidadDisponible} unidades disponibles`);
    }

    const datos = {
      idImpulso: this.productoSeleccionado.id,
      codigo: this.productoSeleccionado.codigo,
      nombre: this.productoSeleccionado.nombre,
      fechaVencimiento: this.productoSeleccionado.fechaVencimiento,
      cantidadAsignada: this.cantidadAsignar,
      asignadoA: this.usuarioDestino,
      fechaAsignacion: Date.now()
    };

    this.FirebaseRealtimeDatabaseService.insertar("AsignacionesImpulso", datos)
      .then(() => {
        alertExito("Asignado", "Producto enviado correctamente", this.router, '/inventario-diario');
        this.calcularDisponible(); // Actualiza la cantidad disponible
        this.usuarioDestino = '';
        this.cantidadAsignar = null;
      })
      .catch(() => alertError("Error al asignar"));
  }
  // 👇 REEMPLAZA ESTA FUNCIÓN COMPLETAMENTE
  // cargarAsignaciones() {
  //   this.FirebaseRealtimeDatabaseService.listado("AsignacionesImpulso").subscribe(todas => {
  //     if (this.esEncargado()) {
  //       this.asignaciones = todas;
  //     } else {
  //       this.asignaciones = todas.filter((a: any) => a.asignadoA === this.usuarioActivo.nombre);
  //     }
  //     // Aplicamos filtros cada vez que cargan los datos
  //     this.aplicarFiltros();
  //   });
  // }


  // // Función para aplicar todos los filtros juntos
  // aplicarFiltros() {
  //   let resultado = [...this.asignaciones];

  //   // Filtro por usuario (solo encargado)
  //   if (this.esEncargado() && this.filtroUsuario) {
  //     resultado = resultado.filter(a => a.asignadoA === this.filtroUsuario);
  //   }

  //   // Filtro por código o nombre
  //   const texto = this.filtroMedicamento.trim().toLowerCase();
  //   if (texto) {
  //     resultado = resultado.filter(a =>
  //       a.codigo.toLowerCase().includes(texto) ||
  //       a.nombre.toLowerCase().includes(texto)
  //     );
  //   }

  //   this.asignacionesFiltradas = resultado;
  // }

  // Abrir modal principal
  AbrirModalImpulsos() {
    this.MostrarModalImpulsos = true;
    this.cargarAsignaciones();
    if (this.esEncargado()) this.cargarProductos();
  }

  CerrarModalImpulsos() {
    this.MostrarModalImpulsos = false;
    this.ventasDelProducto = [];
  }


  // Cargar productos globales
  cargarProductos() {
    this.FirebaseRealtimeDatabaseService.listado("Impulsos")
      .subscribe(res => this.Impulsos = res || []);
  }

  // Aplicar filtros
  aplicarFiltros() {
    let res = [...this.asignaciones];
    if (this.esEncargado() && this.filtroUsuario) res = res.filter(a => a.asignadoA === this.filtroUsuario);
    const texto = this.filtroMedicamento.trim().toLowerCase();
    if (texto) res = res.filter(a => a.codigo.toLowerCase().includes(texto) || a.nombre.toLowerCase().includes(texto));
    this.asignacionesFiltradas = res;
  }



  cargarAsignaciones() {
    this.FirebaseRealtimeDatabaseService.listado("AsignacionesImpulso").subscribe(asignaciones => {
      this.FirebaseRealtimeDatabaseService.listado("VentasImpulso").subscribe(ventas => {
        let lista = this.esEncargado()
          ? asignaciones
          : asignaciones.filter((a: any) => a.asignadoA === this.usuarioActivo.nombre);

        // Agregar total vendido a cada asignación
        this.asignaciones = lista.map((a: any) => {
          const vendido = ventas
            .filter((v: any) => v.idAsignacion === a.id)
            .reduce((sum: number, v: any) => sum + v.cantidadVendida, 0);
          return { ...a, vendido };
        });

        this.aplicarFiltros();
      });
    });
  }


  // --- FUNCIÓN CARGAR VENTAS POR PRODUCTO (AHORA MUESTRA SIEMPRE) ---
  cargarVentasDelProducto(producto: any) {
    this.prodSeleccionado = producto;
    this.noFactura = '';
    this.cantidadVender = null;
    this.mostrarAyuda = false;
    this.asignacionAyudaSeleccionada = null;
    this.FirebaseRealtimeDatabaseService.listado("VentasImpulso").subscribe(ventas => {
      this.ventasDelProducto = ventas
        .filter((v: any) => v.idAsignacion === producto.id)
        .sort((a: any, b: any) => b.fecha - a.fecha);

      // ✅ ACTUALIZAMOS EL TOTAL VENDIDO EN LA ASIGNACIÓN
      this.prodSeleccionado.vendido = this.ventasDelProducto.reduce((sum: number, v: any) => sum + v.cantidadVendida, 0);
    });
      this.modalHistorialAbierto = true;
  }


  // Calcula el porcentaje de venta para usarlo en la tarjeta
  calcularPorcentajeVendido(asignacion: any): number {
    const total = asignacion.cantidadAsignada;
    const vendido = asignacion.vendido || 0;
    if (total <= 0) return 0;
    return Math.round((vendido / total) * 100);
  }
  // Calcula la diferencia en meses entre hoy y la fecha de vencimiento
  diferenciaMeses(fecha: string | Date): number {
    const hoy = new Date();
    const vence = new Date(fecha);
    return (vence.getFullYear() - hoy.getFullYear()) * 12 + (vence.getMonth() - hoy.getMonth());
  }

  // Devuelve la clase de color según los meses que faltan
  colorVencimiento(fecha: string | Date): string {
    const meses = this.diferenciaMeses(fecha);
    if (meses <= 1) return 'text-danger';
    if (meses === 2) return 'text-warning';
    if (meses === 3) return 'text-warning';
    return 'text-success';
  }


  abrirModalVenta() {
    this.noFactura = '';
    this.cantidadVender = null;
    this.mostrarAyuda = false;
    this.asignacionAyudaSeleccionada = null;
    this.modalVentaAbierto = true;

    // ✅ Carga la lista de otros usuarios CADA VEZ que abres el modal
    this.cargarOtrasAsignaciones();
  }


  cerrarModalVenta() {
    this.modalVentaAbierto = false;
    this.mostrarAyuda = false;
    this.asignacionAyudaSeleccionada = null;
  }

  // --- NUEVA FUNCIÓN ---
  cambiarModoAyuda() {
    this.mostrarAyuda = !this.mostrarAyuda;
  }

  // --- NUEVA FUNCIÓN ---
  cargarOtrasAsignaciones() {
    this.FirebaseRealtimeDatabaseService.listado("AsignacionesImpulso").subscribe(asignaciones => {
      this.FirebaseRealtimeDatabaseService.listado("VentasImpulso").subscribe(ventas => {
        this.listaOtrasAsignaciones = asignaciones
          .filter((a: any) =>
            a.idImpulso === this.prodSeleccionado.idImpulso && // Mismo medicamento
            a.asignadoA !== this.usuarioActivo.nombre // No soy yo
          )
          .map((a: any) => {
            const vendido = ventas.filter(v => v.idAsignacion === a.id).reduce((suma: number, v: any) => suma + v.cantidadVendida, 0);
            return { ...a, vendido, disponible: a.cantidadAsignada - vendido };
          })
          .filter(a => a.disponible > 0); // Solo los que tienen saldo
      });
    });
  }

  // --- FUNCIÓN GUARDAR VENTA (CON TU LLAMADA ORIGINAL) ---
  guardarVenta() {
    const asignacionFinal = this.mostrarAyuda ? this.asignacionAyudaSeleccionada : this.prodSeleccionado;
    const disponible = asignacionFinal.cantidadAsignada - (asignacionFinal.vendido || 0);

    if (!this.noFactura || !this.cantidadVender || this.cantidadVender < 1) {
      return alertError("Completa todos los campos obligatorios");
    }

    if (this.cantidadVender > disponible) {
      return alertError(`Solo hay ${disponible} unidades disponibles para vender`);
    }

    const datos = {
      idAsignacion: asignacionFinal.id,
      idImpulso: asignacionFinal.idImpulso,
      codigo: asignacionFinal.codigo,
      nombre: asignacionFinal.nombre,
      cantidadVendida: this.cantidadVender,
      noFactura: this.noFactura.toUpperCase().trim(),
      asignadoA: asignacionFinal.asignadoA,
      vendidoPor: this.usuarioActivo.nombre,
      esAyuda: this.mostrarAyuda,
      fecha: Date.now()
    };

    this.FirebaseRealtimeDatabaseService.insertar("VentasImpulso", datos)
      .then(() => {
        // ✅ ACTUALIZAMOS EL VALOR LOCAL PARA QUE SE REFLEJE INMEDIATAMENTE
        asignacionFinal.vendido = (asignacionFinal.vendido || 0) + this.cantidadVender;

        // ✅ TU MENSAJE Y LLAMADAS ORIGINALES
        alertExito("Venta registrada", "Se actualizó tu saldo", this.router, '/inventario-diario');
        this.cerrarModalVenta();
        this.cargarAsignaciones();
        this.cargarVentasDelProducto(this.prodSeleccionado);
      })
      .catch(() => alertError("No se pudo guardar la venta"));
  }

  editarProducto(producto: any) {
    this.productoEditar = producto;
    // ✅ CARGA TUS DATOS EN LOS CAMPOS
    this.codigo = producto.codigo;
    this.nombre = producto.nombre;
    this.cantidad = producto.cantidadTotal;
    this.fechaVenc = producto.fechaVencimiento;
    this.abrirFormulario = true;
  }



  guardarProducto() {
    if (!this.esEncargado() || !this.codigo || !this.nombre || !this.cantidad || !this.fechaVenc) {
      return alertError("Complete todos los campos");
    }

    const datos = {
      codigo: this.codigo.toUpperCase(),
      nombre: this.nombre.toUpperCase(),
      cantidadTotal: this.cantidad,
      fechaVencimiento: this.fechaVenc,
      fechaCreacion: Date.now()
    };

    if (this.productoEditar) {
      // ✅ USAMOS TU MÉTODO "editar" DEL SERVICIO
      this.FirebaseRealtimeDatabaseService.editar("Impulsos", {
        id: this.productoEditar.id,
        ...datos
      })
        .then(() => {
          alertExito("Actualizado", "Producto modificado correctamente", this.router, '/inventario-diario');
          this.cerrarFormulario();
          this.cargarProductos();
        })
        .catch(() => alertError("Error al actualizar"));
    } else {
      // ✅ TU LÓGICA ORIGINAL PARA AGREGAR NUEVO
      this.FirebaseRealtimeDatabaseService.insertar("Impulsos", datos)
        .then(() => {
          alertExito("Guardado", "Producto creado", this.router, '/inventario-diario');
          this.cerrarFormulario();
          this.cargarProductos();
        })
        .catch(() => alertError("Error al guardar"));
    }
  }


  eliminarProducto(producto: any) {
    const nombre = `${producto.codigo} - ${producto.nombre}`;

    alertEliminarSinRedirigir(
      () => this.FirebaseRealtimeDatabaseService.eliminar(producto.id, "Impulsos")
        .then(() => {
          // ✅ USAMOS EL ÉXITO SIN REDIRIGIR
          alertExitoSinRedirigir("Eliminado", "Producto eliminado correctamente");
          this.cargarProductos();
          this.productoEditar = null;
        })
        .catch(() => alertError("No se pudo eliminar el producto")),
      nombre
    );
  }








  // --- CERRAR Y LIMPIAR FORMULARIO ---
  cerrarFormulario() {
    this.abrirFormulario = false;
    this.productoEditar = null;
    this.codigo = this.nombre = this.fechaVenc = '';
    this.cantidad = null;
  }
  // --- ELIMINAR ASIGNACIÓN ---
  async eliminarAsignacion(asignacion: any) {
    const nombreAsignacion = `${asignacion.codigo} - ${asignacion.nombre} (para ${asignacion.asignadoA})`;

    alertEliminarSinRedirigir(
      async () => {
        try {
          // Cargar y eliminar ventas asociadas
          const ventas = await firstValueFrom(
            this.FirebaseRealtimeDatabaseService.listado("VentasImpulso")
          );

          const ventasAsociadas = ventas.filter((v: any) => v.idAsignacion === asignacion.id);

          for (const venta of ventasAsociadas) {
            await this.FirebaseRealtimeDatabaseService.eliminar(venta.id, "VentasImpulso");
          }

          // Eliminar asignación
          await this.FirebaseRealtimeDatabaseService.eliminar(asignacion.id, "AsignacionesImpulso");

          alertExitoSinRedirigir("Eliminado", "Asignación y sus ventas eliminadas correctamente");
          this.cargarAsignaciones();
        } catch (error) {
          alertError("No se pudo eliminar, intenta nuevamente");
        }
      },
      nombreAsignacion
    );
  }


  // --- ELIMINAR REGISTRO DE VENTA (SE QUEDA EN EL MODAL) ---
  eliminarVenta(venta: any) {
    const nombreVenta = `Factura ${venta.noFactura} - Cantidad: ${venta.cantidadVendida}`;

    alertEliminarSinRedirigir(
      () => this.FirebaseRealtimeDatabaseService.eliminar(venta.id, "VentasImpulso")
        .then(() => {
          alertExitoSinRedirigir("Eliminado", "Venta eliminada correctamente");
          this.cargarVentasDelProducto(this.prodSeleccionado); // Refresca el historial
        }),
      nombreVenta
    );
  }

  // --- CALCULAR FECHAS PARA COLOREAR ---
  estaVencido(fecha: any): boolean {
    if (!fecha) return false;
    const hoy = new Date();
    const fechaVenc = new Date(fecha);
    return fechaVenc < hoy;
  }

  proximoAVencer(fecha: any): boolean {
    if (!fecha) return false;
    const hoy = new Date();
    const fechaVenc = new Date(fecha);
    const diasDiferencia = Math.ceil((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diasDiferencia >= 0 && diasDiferencia <= 15; // Menos de 15 días para vencer
  }



// Función para cerrar el modal
cerrarModalHistorial() {
  this.modalHistorialAbierto = false;
}

alternarTablaInventario() {
  this.tablaInventarioAbierta = !this.tablaInventarioAbierta;
}


// ✅ Función para abrir el modal de ayuda
abrirModalAyudaGeneral() {
  this.modoAyudaGeneral = true;
  this.mostrarAyuda = true;
  // Limpiamos selecciones anteriores
  this.asignacionAyudaSeleccionada = null;
  this.noFactura = '';
  this.cantidadVender = null;
  // Cargamos los productos disponibles
  this.cargarListaOtrasAsignaciones();
  // Abrimos el modal de venta que ya tienes
  this.modalVentaAbierto = true;
}

cargarListaOtrasAsignaciones() {
  // ✅ CARGAMOS DIRECTAMENTE TODAS LAS ASIGNACIONES DE LA BASE (SIN FILTRO DE ROL)
  this.FirebaseRealtimeDatabaseService.listado("AsignacionesImpulso").subscribe(todasAsignaciones => {
    this.FirebaseRealtimeDatabaseService.listado("VentasImpulso").subscribe(ventas => {
      
      if (!Array.isArray(todasAsignaciones)) {
        this.listaOtrasAsignaciones = [];
        return;
      }

      // ✅ Procesamos TODOS los productos de TODOS los usuarios
      this.listaOtrasAsignaciones = todasAsignaciones
        .map((a: any) => {
          const vendido = ventas
            .filter((v: any) => v.idAsignacion === a.id)
            .reduce((sum: number, v: any) => sum + v.cantidadVendida, 0);
          
          return {
            ...a,
            vendido: vendido,
            disponible: Number(a.cantidadAsignada || 0) - vendido,
            asignadoA: (a.asignadoA || '').trim()
          };
        })
        .filter(a => a.disponible > 0); 
    });
  });
}


}
