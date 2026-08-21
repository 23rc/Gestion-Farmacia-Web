import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseRealTimeDatabaseService } from '../../../services/firebase-Realtime-Database.service';
import {
  alertExitoSinRedirigir,
  alertError,
  alertEliminarSinRedirigir
} from '../../../services/utils';
import { FirebaseAuthService } from '../../../services/firebase-auth.service';
import { Router } from '@angular/router';


interface Cliente {
  id?: string;
  nombre: string;
  sistema: string;
  montoInstalacion: number;
  montoRentaMensual: number;
  fechaInicio: string;
  diaPagoMensual: number;
  sociosAsignados: string[];
}

interface Pago {
  id?: string;
  idCliente: string;
  nombreCliente: string;
  tipoPago: string;
  monto: number;
  fechaPago: string;
  mesCorrespondiente: string;
  anioCorrespondiente: string;
  metodoPago: 'Efectivo' | 'Transferencia';
  referenciaAutorizacion: string;
}

interface ResumenDeuda {
  mesesAtrasados: number;
  pendienteInstalacion: number;
  pendienteRenta: number;
  nombresMesesPendientes: string[];
  total: number;
}

interface ReporteSocio {
  nombreSocio: string;
  totalPagadoInstalacion: number;
  totalPagadoRenta: number;
  totalPagadoGeneral: number;
  porCobrarInstalacion: number;
  porCobrarRenta: number;
  porCobrarGeneral: number;
  granTotal: number;
}
interface Gasto {
  id?: string;
  tipoConcepto: string;
  tipoConceptoAnterior: string;
  descripcion: string;
  montoTotal: number;
  fechaGasto: string;
  empresasSeleccionadas: string[];
  nombresEmpresas: string;
  tipoReparto: 'todos' | 'seleccion';
  sociosAsignados: string[];
  montoPorSocio: number;
  metodoPago: 'Efectivo' | 'Transferencia';
  referenciaAutorizacion: string;
}



interface ReporteSocioActualizado extends ReporteSocio {
  totalGastos: number;
  subtotalIngresos: number;
  saldoNeto: number;
}

@Component({
  selector: 'app-finanzas-prosystem',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finanzas-prosystem.component.html',
  styleUrl: './finanzas-prosystem.component.css'
})
export class FinanzasProsystemComponent {
  cargando: boolean = true;
  nombreUsuario: string = '';
  busquedaEmpresa: string = '';
  sociosDisponibles = [
    'Roberto Carlos Yoxón Cuj',
    'Walter Alfredeo Canú',
    'Victor Samines'
  ];

  tiposPago = ['Instalación', 'Renta'];
  metodosPago = ['Efectivo', 'Transferencia'];
  meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  anios = ['2025', '2026', '2027', '2028', '2029', '2030'];

  modales: { [nombre: string]: boolean } = {
    cliente: false,
    pago: false,
    verPagos: false,
    ganancias: false,
    gasto: false,
    listaGastos: false
  };
  totalGeneralGastos: number = 0;
  totalGeneralNeto: number = 0;
  subtotalIngresosGeneral: number = 0;
  reporteSocios: ReporteSocio[] = [];
  clienteActual!: Cliente;
  clientes: Cliente[] = [];
  cliente: Cliente = {
    nombre: '',
    sistema: '',
    montoInstalacion: 0,
    montoRentaMensual: 0,
    fechaInicio: new Date().toISOString().split('T')[0],
    diaPagoMensual: new Date().getDate(),
    sociosAsignados: []
  };
  pagos: Pago[] = [];
  pago: Pago = {
    idCliente: '',
    nombreCliente: '',
    tipoPago: '',
    monto: 0,
    fechaPago: new Date().toISOString().split('T')[0],
    mesCorrespondiente: '',
    anioCorrespondiente: '',
    metodoPago: 'Efectivo',
    referenciaAutorizacion: ''
  };
  totalesGenerales = {
    totalPagadoInstalacion: 0,
    totalPagadoRenta: 0,
    totalPagadoGeneral: 0,
    porCobrarInstalacion: 0,
    porCobrarRenta: 0,
    porCobrarGeneral: 0,
    granTotal: 0
  };
  tiposConceptoGasto = [
    'Renta Mensual',
    'Smarter Asp.Net (Base de Datos)',
    'Vercel (Front End)',
    'Railway (Back End)',
    'Pago Vendedor',
    'Pago Contador',
    'Otros'
  ];

  gastos: Gasto[] = [];
  todosLosGastos: Gasto[] = [];

  gasto: Gasto = {
    tipoConcepto: '',
    tipoConceptoAnterior: '',
    descripcion: '',
    montoTotal: 0,
    fechaGasto: new Date().toISOString().split('T')[0],
    empresasSeleccionadas: [],
    nombresEmpresas: '',
    tipoReparto: 'todos',
    sociosAsignados: [...this.sociosDisponibles],
    montoPorSocio: 0,
    metodoPago: 'Efectivo',
    referenciaAutorizacion: ''
  };
  reporteConGastos: ReporteSocioActualizado[] = [];

  clienteSeleccionadoNombre = '';
  todosLosPagos: Pago[] = [];


  constructor(private db: FirebaseRealTimeDatabaseService, private router: Router, private authService: FirebaseAuthService) {
    this.cargarTodo();

    this.authService.user$.subscribe(usuario => {
      if (usuario && usuario.email) {
        this.nombreUsuario = this.obtenerNombrePorCorreo(usuario.email);
      }
      this.cargando = false;
    });

  }
  obtenerNombrePorCorreo(correo: string): string {
    const mapa: { [correo: string]: string } = {
      'roberto@gmail.com': 'Roberto Carlos Yoxón Cuj',
      'walter@gmail.com': 'Walter Alfredeo Canú'
    };
    return mapa[correo] || correo;
  }
get esWalter(): boolean {
  const usuario = this.authService.user$.value;
  if (!usuario || !usuario.email) return false;
  return usuario.email.trim().toLowerCase() === 'walter@gmail.com';
}


  cargarTodo() {
    this.db.listado('ClienteProSystem').subscribe(lista => this.clientes = lista);
    this.db.listado('PagosProSystem').subscribe(pagos => this.todosLosPagos = pagos);
    this.db.listado('GastosProSystem').subscribe(gastos => this.todosLosGastos = gastos);
  }

  nuevoClienteVacio(): Cliente {
    return {
      nombre: '',
      sistema: '',
      montoInstalacion: 0,
      montoRentaMensual: 0,
      fechaInicio: new Date().toISOString().split('T')[0],
      diaPagoMensual: new Date().getDate(),
      sociosAsignados: []
    };
  }

  abrirModal(nombreModal: string, c?: Cliente) {
    if (c) {
      this.cliente = { ...c };
    } else {
      this.cliente = this.nuevoClienteVacio();
    }
    this.modales[nombreModal] = true;
  }

  cerrarModal(nombreModal: string) {
    this.modales[nombreModal] = false;
    if (nombreModal === 'cliente') {
      this.limpiarCliente();
    }
  }

  limpiarCliente() {
    this.cliente = {
      nombre: '',
      sistema: '',
      montoInstalacion: 0,
      montoRentaMensual: 0,
      fechaInicio: new Date().toISOString().split('T')[0],
      diaPagoMensual: new Date().getDate(),
      sociosAsignados: []
    };
  }


  async guardarCliente() {
    if (!this.cliente.nombre) { alertError('Escribe el nombre del cliente'); return; }
    if (!this.cliente.sociosAsignados.length) { alertError('Selecciona al menos un socio'); return; }

    this.cliente.id
      ? await this.db.editar('ClienteProSystem', this.cliente)
      : await this.db.insertar('ClienteProSystem', this.cliente);

    alertExitoSinRedirigir('¡Guardado!', this.cliente.id ? 'Cliente actualizado ✅' : 'Cliente registrado ✅');
    this.cerrarModal('cliente');
  }

  async eliminarCliente(c: Cliente) {
    if (!c.id) return;

    const pagosAEliminar = this.todosLosPagos.filter(p => p.idCliente === c.id);

    const eliminarYContinuar = async () => {
      for (const pago of pagosAEliminar) {
        if (pago.id) {
          await this.db.eliminar(pago.id, 'PagosProSystem');
        }
      }
      await this.db.eliminar(c.id!, 'ClienteProSystem');
    };

    alertEliminarSinRedirigir(eliminarYContinuar, c.nombre);
  }

  cargarClientes() {
    this.db.listado('ClienteProSystem').subscribe(lista => this.clientes = lista);
  }

  toggleSocio(nombreSocio: string) {
    const existe = this.cliente.sociosAsignados.includes(nombreSocio);
    if (existe) {
      this.cliente.sociosAsignados = this.cliente.sociosAsignados.filter(s => s !== nombreSocio);
    } else {
      this.cliente.sociosAsignados.push(nombreSocio);
    }
  }

  estaSeleccionado(nombreSocio: string): boolean {
    return this.cliente.sociosAsignados.includes(nombreSocio);
  }

  abrirModalPagar(c: Cliente, pagoEditar?: Pago) {
    if (!c.id) return;
    this.clienteActual = c;
    this.clienteSeleccionadoNombre = c.nombre;
    if (pagoEditar && pagoEditar.id) {
      this.pago = { ...pagoEditar };
    } else {
      this.pago = {
        idCliente: c.id,
        nombreCliente: c.nombre,
        tipoPago: '',
        monto: 0,
        fechaPago: new Date().toISOString().split('T')[0],
        mesCorrespondiente: '',
        anioCorrespondiente: '',
        metodoPago: 'Efectivo',
        referenciaAutorizacion: ''
      };
    }
    this.modales['pago'] = true;
  }

  getPendienteInstalacion(): number {
    if (!this.clienteActual) return 0;
    const pagosCliente = this.todosLosPagos.filter(p => p.idCliente === this.clienteActual.id && p.tipoPago === 'Instalación');
    const totalPagado = pagosCliente.reduce((sum, p) => sum + p.monto, 0);
    return Math.max(0, this.clienteActual.montoInstalacion - totalPagado);
  }

  alCambiarTipoPago() {
    if (this.pago.tipoPago === 'Renta') {
      this.pago.monto = this.clienteActual.montoRentaMensual;
    }
    if (this.pago.tipoPago === 'Instalación') {
      this.pago.monto = this.getPendienteInstalacion();
    }
  }

  async guardarPago() {
    if (!this.pago.tipoPago) { alertError('Selecciona el tipo de pago'); return; }
    if (!this.pago.monto || this.pago.monto <= 0) { alertError('Ingresa el monto del pago'); return; }

    if (this.pago.metodoPago === 'Transferencia' && !this.pago.referenciaAutorizacion.trim()) {
      alertError('⚠️ En Transferencia debes colocar el N° de Autorización / Referencia del baucher');
      return;
    }

    // ✅ VALIDACIÓN 1: Instalación → NO pagar más de lo pendiente
    if (this.pago.tipoPago === 'Instalación') {
      const pendiente = this.getPendienteInstalacion();
      if (this.pago.monto > pendiente) {
        alertError(`⚠️ Solo falta pagar Q${pendiente}. No puedes abonar más del monto pendiente.`);
        return;
      }
    }

    if (this.pago.tipoPago === 'Renta') {
      if (!this.pago.mesCorrespondiente) { alertError('Selecciona el mes'); return; }
      if (!this.pago.anioCorrespondiente) { alertError('Selecciona el año'); return; }

      const resumen = this.calcularDeuda(this.clienteActual);
      const mesCompleto = `${this.pago.mesCorrespondiente} ${this.pago.anioCorrespondiente}`;

      if (!resumen.nombresMesesPendientes.includes(mesCompleto)) {
        alertError(`⚠️ El mes "${mesCompleto}" no está pendiente de pago. Revisa los meses pendientes e intenta nuevamente.`);
        return;
      }
    }

    if (this.pago.id) {
      await this.db.editar('PagosProSystem', this.pago);
      alertExitoSinRedirigir('¡Actualizado!', 'Pago modificado correctamente ✅');
    } else {
      await this.db.insertar('PagosProSystem', this.pago);
      alertExitoSinRedirigir('¡Pago registrado!', 'El pago se guardó correctamente ✅');
    }
    this.cerrarModalPago();
    this.cerrarModalVerPagos();
  }



  cerrarModalPago() {
    this.modales['pago'] = false;
    this.pago = {
      idCliente: '', nombreCliente: '', tipoPago: '', monto: 0, fechaPago: '',
      mesCorrespondiente: '', anioCorrespondiente: '',
      metodoPago: 'Efectivo', referenciaAutorizacion: ''
    };
    this.clienteSeleccionadoNombre = '';
  }

  abrirVerPagos(c: Cliente) {
    if (!c.id) return;
    this.clienteSeleccionadoNombre = c.nombre;
    this.db.listado('PagosProSystem').subscribe(todosLosPagos => {
      this.pagos = todosLosPagos.filter(p => p.idCliente === c.id);
    });
    this.modales['verPagos'] = true;
  }

  cerrarModalVerPagos() {
    this.modales['verPagos'] = false;
    this.pagos = [];
    this.clienteSeleccionadoNombre = '';
  }
  async eliminarPago(p: Pago) {
    if (!p.id) return;
    alertEliminarSinRedirigir(async () => {
      await this.db.eliminar(p.id!, 'PagosProSystem');
      this.pagos = this.pagos.filter(item => item.id !== p.id);
    }, `${p.tipoPago} - ${p.mesCorrespondiente} ${p.anioCorrespondiente}`);
  }

  getMesesPendientesTexto(): string {
    if (!this.clienteActual) return '';
    const resumen = this.calcularDeuda(this.clienteActual);
    if (resumen.nombresMesesPendientes.length === 0) return '✅ Sin pagos pendientes';
    return resumen.nombresMesesPendientes.join(', ');
  }

  calcularDeuda(cliente: Cliente): ResumenDeuda {
    const hoy = new Date();

    // ✅ LEER FECHA CORRECTAMENTE: EVITAR EL ERROR DE ZONA HORARIA
    const partes = cliente.fechaInicio.split('-');
    const anioInicio = parseInt(partes[0], 10);
    const mesInicio = parseInt(partes[1], 10) - 1; // Restamos 1 porque JS cuenta desde 0
    const diaInicio = parseInt(partes[2], 10);

    const pagosCliente = this.todosLosPagos.filter(p => p.idCliente === cliente.id);

    // --- Cálculo de Instalación ---
    const pagosInstalacion = pagosCliente.filter(p => p.tipoPago === 'Instalación');
    const totalPagadoInstalacion = pagosInstalacion.reduce((sum, p) => sum + p.monto, 0);
    const pendienteInstalacion = Math.max(0, cliente.montoInstalacion - totalPagadoInstalacion);

    // --- Cálculo de Renta mensual ---
    const mesesPendientes: string[] = [];
    const diaCobro = cliente.diaPagoMensual;

    // 📍 HASTA: mes actual o mes anterior si aún no es día de cobro
    let mesFin = hoy.getMonth();
    let anioFin = hoy.getFullYear();

    // ✅ Si HOY todavía NO llegó el día de cobro → se cuenta hasta el mes anterior
    if (hoy.getDate() < diaCobro) {
      if (mesFin === 0) {
        mesFin = 11;
        anioFin--;
      } else {
        mesFin--;
      }
    }

    // 🔴 PROTECCIÓN: Si el mes final es ANTES del mes de inicio → NO hay deuda
    if (anioFin < anioInicio || (anioFin === anioInicio && mesFin < mesInicio)) {
      return {
        mesesAtrasados: 0,
        pendienteInstalacion,
        pendienteRenta: 0,
        nombresMesesPendientes: [],
        total: pendienteInstalacion
      };
    }

    // ✅ RECORREMOS DESDE JULIO HASTA AGOSTO
    let mesActual = mesInicio;   // 6 = JULIO ✅
    let anioActual = anioInicio; // 2026 ✅

    while (anioActual < anioFin || (anioActual === anioFin && mesActual <= mesFin)) {
      const nombreMes = this.meses[mesActual];

      const yaPagado = pagosCliente.some(p =>
        p.tipoPago === 'Renta' &&
        p.mesCorrespondiente === nombreMes &&
        p.anioCorrespondiente === anioActual.toString()
      );

      if (!yaPagado) {
        mesesPendientes.push(`${nombreMes} ${anioActual}`);
      }

      mesActual++;
      if (mesActual > 11) {
        mesActual = 0;
        anioActual++;
      }
    }

    const mesesAtrasados = mesesPendientes.length;
    const pendienteRenta = mesesAtrasados * cliente.montoRentaMensual;
    const total = pendienteInstalacion + pendienteRenta;

    return {
      mesesAtrasados,
      pendienteInstalacion,
      pendienteRenta,
      nombresMesesPendientes: mesesPendientes,
      total
    };
  }

  abrirReporteGanancias() {
    this.reporteSocios = this.generarReporteGanancias();
    const gastosPorSocio = this.calcularGastosPorSocio();

    // ✅ FÓRMULA: Subtotal Ingresos = (Inst + Renta) − Gastos
    // Total Final = Subtotal Ingresos + Subtotal Por Cobrar
    this.reporteConGastos = this.reporteSocios.map(socio => {
      const gastos = gastosPorSocio[socio.nombreSocio] || 0;
      const ingresosBrutos = socio.totalPagadoInstalacion + socio.totalPagadoRenta;
      const subtotalIngresos = ingresosBrutos - gastos; // ✅ Ya restado aquí
      const totalGeneral = subtotalIngresos + socio.porCobrarGeneral; // ✅ Suma de ambos subtotales

      return {
        ...socio,
        totalGastos: gastos,
        subtotalIngresos: subtotalIngresos,
        saldoNeto: totalGeneral
      };
    });

    // ✅ TOTALES GENERALES (corregido: variable que faltaba)
    this.totalGeneralGastos = Object.values(gastosPorSocio).reduce((sum, g) => sum + g, 0);
    const totalIngresosBrutos = this.totalesGenerales.totalPagadoInstalacion + this.totalesGenerales.totalPagadoRenta;

    // ✅ Esta variable es la que faltaba:
    this.subtotalIngresosGeneral = totalIngresosBrutos - this.totalGeneralGastos;

    this.totalGeneralNeto = this.subtotalIngresosGeneral + this.totalesGenerales.porCobrarGeneral;

    this.modales['ganancias'] = true;
  }




  cerrarModalGanancias() {
    this.modales['ganancias'] = false;
    this.reporteSocios = [];
  }

  generarReporteGanancias(): ReporteSocio[] {
    const reporte: { [nombre: string]: ReporteSocio } = {};

    this.sociosDisponibles.forEach(socio => {
      reporte[socio] = {
        nombreSocio: socio,
        totalPagadoInstalacion: 0,
        totalPagadoRenta: 0,
        totalPagadoGeneral: 0,
        porCobrarInstalacion: 0,
        porCobrarRenta: 0,
        porCobrarGeneral: 0,
        granTotal: 0
      };
    });

    this.clientes.forEach(cliente => {
      if (!cliente.id || cliente.sociosAsignados.length === 0) return;

      const cantidadSocios = cliente.sociosAsignados.length;
      const porcentajePorSocio = 1 / cantidadSocios;

      const pagosCliente = this.todosLosPagos.filter(p => p.idCliente === cliente.id);

      const pagosInstalacion = pagosCliente.filter(p => p.tipoPago === 'Instalación');
      const totalPagadoInst = pagosInstalacion.reduce((sum, p) => sum + p.monto, 0);

      const pagosRenta = pagosCliente.filter(p => p.tipoPago === 'Renta');
      const totalPagadoRent = pagosRenta.reduce((sum, p) => sum + p.monto, 0);

      const resumenDeuda = this.calcularDeuda(cliente);
      const faltaInstalacion = resumenDeuda.pendienteInstalacion;
      const faltaRenta = resumenDeuda.pendienteRenta;

      cliente.sociosAsignados.forEach(nombreSocio => {
        if (!reporte[nombreSocio]) return;

        reporte[nombreSocio].totalPagadoInstalacion += totalPagadoInst * porcentajePorSocio;
        reporte[nombreSocio].totalPagadoRenta += totalPagadoRent * porcentajePorSocio;

        reporte[nombreSocio].porCobrarInstalacion += faltaInstalacion * porcentajePorSocio;
        reporte[nombreSocio].porCobrarRenta += faltaRenta * porcentajePorSocio;
      });
    });

    // ✅ CALCULAMOS TODO EXPLÍCITAMENTE + TOTALES GENERALES
    const resultado = Object.values(reporte).map(socio => {
      const totalPagadoGeneral = socio.totalPagadoInstalacion + socio.totalPagadoRenta;
      const porCobrarGeneral = socio.porCobrarInstalacion + socio.porCobrarRenta;
      const granTotal = totalPagadoGeneral + porCobrarGeneral;

      return {
        ...socio,
        totalPagadoGeneral,
        porCobrarGeneral,
        granTotal
      };
    });

    // ✅ SUMA TOTAL DE TODAS LAS COLUMNAS
    this.totalesGenerales = {
      totalPagadoInstalacion: resultado.reduce((sum, s) => sum + s.totalPagadoInstalacion, 0),
      totalPagadoRenta: resultado.reduce((sum, s) => sum + s.totalPagadoRenta, 0),
      totalPagadoGeneral: resultado.reduce((sum, s) => sum + s.totalPagadoGeneral, 0),
      porCobrarInstalacion: resultado.reduce((sum, s) => sum + s.porCobrarInstalacion, 0),
      porCobrarRenta: resultado.reduce((sum, s) => sum + s.porCobrarRenta, 0),
      porCobrarGeneral: resultado.reduce((sum, s) => sum + s.porCobrarGeneral, 0),
      granTotal: resultado.reduce((sum, s) => sum + s.granTotal, 0)
    };

    return resultado;
  }

  // ✅ NUEVO: Desglose de ganancias por socio para un cliente específico
  obtenerDesglosePorCliente(cliente: Cliente) {
    if (!cliente.id || cliente.sociosAsignados.length === 0) return [];

    const cantidadSocios = cliente.sociosAsignados.length;
    const porcentaje = 1 / cantidadSocios;

    // Total pagado
    const pagosCliente = this.todosLosPagos.filter(p => p.idCliente === cliente.id);
    const pagosInst = pagosCliente.filter(p => p.tipoPago === 'Instalación').reduce((s, p) => s + p.monto, 0);
    const pagosRenta = pagosCliente.filter(p => p.tipoPago === 'Renta').reduce((s, p) => s + p.monto, 0);
    const totalIngresado = pagosInst + pagosRenta;

    // Total pendiente
    const deuda = this.calcularDeuda(cliente);
    const totalPendiente = deuda.pendienteInstalacion + deuda.pendienteRenta;

    // Reparto por socio
    return cliente.sociosAsignados.map(nombre => ({
      nombreSocio: nombre,
      ingresado: totalIngresado * porcentaje,
      pendiente: totalPendiente * porcentaje,
      total: (totalIngresado + totalPendiente) * porcentaje
    }));
  }







  abrirModalGasto(gastoEditar?: Gasto) {
    if (gastoEditar && gastoEditar.id) {
      // MODO EDICIÓN
      this.gasto = {
        ...gastoEditar,
        empresasSeleccionadas: gastoEditar.empresasSeleccionadas
          ? [...gastoEditar.empresasSeleccionadas]
          : [],
        nombresEmpresas: gastoEditar.nombresEmpresas || '',
        tipoConceptoAnterior: gastoEditar.tipoConcepto,
        metodoPago: gastoEditar.metodoPago || 'Efectivo',
        referenciaAutorizacion: gastoEditar.referenciaAutorizacion || ''
      };
    } else {
      this.gasto = {
        tipoConcepto: '',
        tipoConceptoAnterior: '',
        descripcion: '',
        montoTotal: 0,
        fechaGasto: new Date().toISOString().split('T')[0],
        empresasSeleccionadas: [],
        nombresEmpresas: '',
        tipoReparto: 'todos',
        sociosAsignados: [...this.sociosDisponibles],
        montoPorSocio: 0,
        metodoPago: 'Efectivo',
        referenciaAutorizacion: ''
      };
    }
    this.modales['gasto'] = true;
  }



  cerrarModalGasto() {
    this.modales['gasto'] = false;
    this.limpiarGasto();
  }


  limpiarGasto() {
    this.gasto = {
      tipoConcepto: '',
      tipoConceptoAnterior: '',
      descripcion: '',
      montoTotal: 0,
      fechaGasto: new Date().toISOString().split('T')[0],
      empresasSeleccionadas: [],
      nombresEmpresas: '',
      tipoReparto: 'todos',
      sociosAsignados: [...this.sociosDisponibles],
      montoPorSocio: 0,
      metodoPago: 'Efectivo',       // ✅
      referenciaAutorizacion: ''
    };
  }

  alCambiarConcepto() {
    const tipoAnterior = this.gasto.tipoConceptoAnterior;
    const tipoActual = this.gasto.tipoConcepto;

    // ✅ SOLO limpiar si VENÍAS de Renta Mensual y TE VAS a OTRO concepto
    if (tipoAnterior === 'Renta Mensual' && tipoActual !== 'Renta Mensual') {
      this.gasto.empresasSeleccionadas = [];
      this.gasto.nombresEmpresas = '';
    }

    // ✅ CAMBIO CLAVE: Si ENTRAS a Renta Mensual → NO BORRAR NADA
    // Solo asegurar que exista el arreglo
    if (tipoAnterior !== 'Renta Mensual' && tipoActual === 'Renta Mensual') {
      if (!this.gasto.empresasSeleccionadas) {
        this.gasto.empresasSeleccionadas = [];
      }
    }

    this.gasto.tipoConceptoAnterior = tipoActual;

  }


  toggleEmpresaGasto(cliente: Cliente) {
    if (!cliente.id) return;

    // ✅ SOLO UNA EMPRESA: Al hacer clic, se selecciona ESA y solo ESA
    this.gasto.empresasSeleccionadas = [cliente.id];
    this.gasto.nombresEmpresas = cliente.nombre;

    // ✅ CARGAR SOCIOS AUTOMÁTICAMENTE Y BLOQUEARLOS
    if (cliente.sociosAsignados && Array.isArray(cliente.sociosAsignados)) {
      this.gasto.sociosAsignados = [...cliente.sociosAsignados];

      this.gasto.tipoReparto = 'todos'; // Forzar reparto entre los socios de la empresa
    } else {
      this.gasto.sociosAsignados = [];
    }

    this.calcularMontoPorSocio();
    this.gasto = { ...this.gasto };
  }




  estaEmpresaSeleccionada(id?: string): boolean {
    return id ? this.gasto.empresasSeleccionadas.includes(id) : false;
  }


  actualizarNombresEmpresas() {
    const nombres = this.clientes
      .filter(c => this.gasto.empresasSeleccionadas.includes(c.id!))
      .map(c => c.nombre);
    this.gasto.nombresEmpresas = nombres.join(', ');
  }


  alCambiarTipoReparto() {
    // ✅ Si es Renta Mensual y ya hay empresa seleccionada → NO DEJAR CAMBIAR
    if (this.gasto.tipoConcepto === 'Renta Mensual' && this.gasto.empresasSeleccionadas.length === 1) {
      // Forzar siempre "todos" porque los socios vienen de la empresa
      this.gasto.tipoReparto = 'todos';
      return;
    }

    // Comportamiento normal para otros gastos
    if (this.gasto.tipoReparto === 'todos') {
      this.gasto.sociosAsignados = [...this.sociosDisponibles];
    } else {
      this.gasto.sociosAsignados = [];
    }
    this.calcularMontoPorSocio();
  }


  toggleSocioGasto(nombreSocio: string) {
    const existe = this.gasto.sociosAsignados.includes(nombreSocio);
    if (existe) {
      this.gasto.sociosAsignados = this.gasto.sociosAsignados.filter(s => s !== nombreSocio);
    } else {
      this.gasto.sociosAsignados.push(nombreSocio);
    }
    this.calcularMontoPorSocio();
  }


  estaSeleccionadoGasto(nombreSocio: string): boolean {
    return this.gasto.sociosAsignados.includes(nombreSocio);
  }


  calcularMontoPorSocio() {
    if (this.gasto.sociosAsignados.length > 0 && this.gasto.montoTotal > 0) {
      this.gasto.montoPorSocio = this.gasto.montoTotal / this.gasto.sociosAsignados.length;
    } else {
      this.gasto.montoPorSocio = 0;
    }
  }


  async guardarGasto() {
    if (!this.gasto.tipoConcepto) {
      alertError('Selecciona el tipo de gasto');
      return;
    }
    if (!this.gasto.montoTotal || this.gasto.montoTotal <= 0) {
      alertError('Ingresa el monto del gasto');
      return;
    }
    if (this.gasto.metodoPago === 'Transferencia' && !this.gasto.referenciaAutorizacion.trim()) {
      alertError('⚠️ En Transferencia debes colocar el N° de Autorización / Referencia del baucher');
      return;
    }

    const cantidadEmpresas = this.gasto.empresasSeleccionadas.length;

    if (this.gasto.tipoConcepto === 'Renta Mensual' && cantidadEmpresas === 0) {
      console.error('❌ VALIDACIÓN FALLÓ: dice que hay 0 empresas pero tú las ves seleccionadas');
      alertError('Selecciona al menos una empresa para la Renta Mensual');
      return;
    }

    if (this.gasto.sociosAsignados.length === 0) {
      alertError('Selecciona al menos un socio que pague este gasto');
      return;
    }

    this.calcularMontoPorSocio();

    if (this.gasto.id) {
      await this.db.editar('GastosProSystem', this.gasto);
      alertExitoSinRedirigir('¡Actualizado!', 'Gasto modificado ✅');
    } else {
      await this.db.insertar('GastosProSystem', this.gasto);
      alertExitoSinRedirigir('¡Guardado!', 'Gasto registrado ✅');
    }

    this.cargarTodo();
    this.cerrarModalGasto();
  }

  async eliminarGasto(g: Gasto) {
    if (!g.id) return;
    alertEliminarSinRedirigir(async () => {
      await this.db.eliminar(g.id!, 'GastosProSystem');
    }, `${g.tipoConcepto} - Q${g.montoTotal}`);
  }


  calcularGastosPorSocio(): { [nombre: string]: number } {
    const resultado: { [nombre: string]: number } = {};
    this.sociosDisponibles.forEach(s => resultado[s] = 0);

    this.todosLosGastos.forEach(gasto => {
      gasto.sociosAsignados.forEach(nombreSocio => {
        resultado[nombreSocio] += gasto.montoPorSocio;
      });
    });

    return resultado;
  }


  abrirListaGastos() {
    this.modales['listaGastos'] = true;
  }


  cerrarListaGastos() {
    this.modales['listaGastos'] = false;
  }


  editarGasto(gasto: Gasto) {
    this.abrirModalGasto(gasto);
  }


  obtenerTotalGastos(): number {
    if (!this.todosLosGastos || this.todosLosGastos.length === 0) {
      return 0;
    }
    return this.todosLosGastos.reduce((sum, g) => sum + g.montoTotal, 0);
  }

  async cerrarSesion() {
    try {
      await this.authService.logout();
      alertExitoSinRedirigir('¡Sesión cerrada!', 'Has salido correctamente del sistema ✅');
      this.router.navigate(['/loginprosystem']);
    } catch (error) {
      alertError('No se pudo cerrar la sesión. Inténtalo nuevamente.');
      console.error('Error al cerrar sesión:', error);
    }
  }


}
