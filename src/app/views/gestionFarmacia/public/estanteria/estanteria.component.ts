import { Component, OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { FirebaseRealTimeDatabaseService } from '../../../../services/firebase-Realtime-Database.service';
import { CommonModule, FormatWidth } from '@angular/common';
import { environment } from '../../../../../environments/environment.prod';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-estanteria',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './estanteria.component.html',
  styleUrl: './estanteria.component.css'
})
export class EstanteriaComponent implements OnInit{
  FechaEstanteria = environment.FechaEstantería; // o lo que ya tengas
  FechaProductosMalEstado = environment.FechaProductosMalEstado;
  estanterias: any[] = [];
  ubicaciones: any[] = [];
  busqueda: string = '';  // Variable para almacenar la búsqueda
  isEditing: { [key: string]: boolean } = {};
  newUbicacion: { [key: string]: string } = {};
  editingId: { [key: string]: string } = {}; // Almacena el ID del registro en edición
  resultados: any[] = [];
  resultadoActual: any = null; // Almacena el resultado actual
  esPantallaGrande: boolean = window.innerWidth > 1024; // Inicializa con el tamaño actual
  productosMalEstadoCount: number = 0;
  EstanteriaDesactualizada = false;
  ProductosMalEstadoDesactualizado = false;

  @ViewChildren('resultado') resultadosRef!: QueryList<ElementRef>;
    // Bandera para controlar la activación de la búsqueda
    isBuscando: boolean = false;
  constructor(private firebaseService: FirebaseRealTimeDatabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.obtenerEstanterias();
    this.detectarPantalla(); // Detecta el tamaño inicial
    this.obtenerProductosMalEstadoCount();
    window.addEventListener('resize', this.detectarPantalla.bind(this));
    this.VerificarFechaEstanteria();
    this.VerificarFechaProductosMalEstado();
  }
  
  ngOnDestroy() {
    window.removeEventListener('resize', this.detectarPantalla.bind(this)); // Limpia el listener
  }
  VerificarFechaEstanteria(): void {
    const [dia, mes, anio] = this.FechaEstanteria.split('/').map(Number);
    const fechaEstanteria = new Date(anio, mes - 1, dia);
    const fechaActual = new Date();

    const diferenciaEnMs = fechaActual.getTime() - fechaEstanteria.getTime();
    const diasPasados = diferenciaEnMs / (1000 * 60 * 60 * 24);

    this.EstanteriaDesactualizada = diasPasados > 60;
  }

  VerificarFechaProductosMalEstado(): void {
    const [dia, mes, anio] = this.FechaProductosMalEstado.split('/').map(Number);
    const fechaProductosMalEstado = new Date(anio, mes - 1, dia);
    const fechaActual = new Date();
  
    const diferenciaEnMs = fechaActual.getTime() - fechaProductosMalEstado.getTime();
    const diasPasados = diferenciaEnMs / (1000 * 60 * 60 * 24);
  
    this.ProductosMalEstadoDesactualizado = diasPasados > 15;
  }
  


  obtenerProductosMalEstadoCount() {
    this.firebaseService.contarRegistros('productosMalEstado').subscribe(
      (count) => {
        this.productosMalEstadoCount = count;
      },
      (error) => {
        console.error('Error al contar productos en mal estado:', error);
      }
    );
  }
  detectarPantalla() {
    this.esPantallaGrande = window.innerWidth > 1024;
  }
  obtenerEstanterias() {
    this.firebaseService.listado('estanterias').subscribe(
      (data) => {
        // Ordenar las estanterías por el número (esto supone que el nombre tiene un formato como "Estantería 1", "Estantería 2", etc.)
        this.estanterias = data.sort((a, b) => {
          const numA = parseInt(a.nombreEstanteria.split(' ')[1], 10);  // Obtener el número de la estantería (ejemplo: "Estantería 1")
          const numB = parseInt(b.nombreEstanteria.split(' ')[1], 10);  // Obtener el número de la estantería
          return numA - numB;  // Ordenar numéricamente
        });
        this.cargarUbicaciones();
      },
      (error) => {
        console.error('Error al obtener estanterías:', error);
      }
    );
  }
  

  cargarUbicaciones() {
    this.firebaseService.listado('ubicacionesEstanterias').subscribe(
      (ubicaciones) => {
        this.ubicaciones = ubicaciones;
      },
      (error) => {
        console.error('Error al obtener ubicaciones:', error);
      }
    );
  }

  obtenerDatoCelda(i: number, j: number, nombreEstanteria: string): string {
    let columnaBuscada = j + 1;
    const estanteriasConRotacion = ['ESTANTERÍA 1 [ENFRENTE]', 'ESTANTERÍA 2 [ENFRENTE]','ESTANTERÍA 5 [ATRÁS]'];
    const esPantallaGrande = window.innerWidth > 1024;
  
    if (
      esPantallaGrande && 
      estanteriasConRotacion.some(criterio => nombreEstanteria.toUpperCase().includes(criterio))
    ) {
      const totalColumnas = Math.max(...this.ubicaciones
        .filter(u => u.nombreEstanteria === nombreEstanteria)
        .map(u => u.columna));
      columnaBuscada = totalColumnas - j;
    }
    const ubicacion = this.ubicaciones.find(ubicacion =>
      ubicacion.fila === (i + 1) &&
      ubicacion.columna === columnaBuscada &&
      ubicacion.nombreEstanteria === nombreEstanteria
    );
  
    return ubicacion ? ubicacion.dato : '';
  }
  
  ubicacionExistente(i: number, j: number, nombreEstanteria: string): boolean {
    return this.ubicaciones.some(ubicacion =>
      ubicacion.fila === (i + 1) &&
      ubicacion.columna === (j + 1) &&
      ubicacion.nombreEstanteria === nombreEstanteria
    );
  }

actualizarUbicaciones() {
  this.firebaseService.listado('ubicacionesEstanterias').subscribe(
      (ubicaciones) => {
          this.ubicaciones = ubicaciones;
      },
      (error) => {
          console.error('Error al obtener ubicaciones:', error);
      }
  );
}
buscar() {
  if (this.busqueda.trim() === '') {
    this.resultados = [];
    return;
  }

  this.resultados = [];

  this.estanterias.forEach(estanteria => {
    for (let i = 0; i < estanteria.cantidadFilas; i++) {
      for (let j = 0; j < 9; j++) {
        const dato = this.obtenerDatoCelda(i, j, estanteria.nombreEstanteria).toLowerCase();
        
        if (dato.includes(this.busqueda.toLowerCase())) {
          this.resultados.push({ estanteria, fila: i, columna: j });
        }
      }
    }
  });

  if (this.resultados.length > 0) {
    this.scrollToResultado(this.resultados[0]);
  }
}
resaltarCelda(i: number, j: number, nombreEstanteria: string): boolean {
  const datoCelda = this.obtenerDatoCelda(i, j, nombreEstanteria).toLowerCase();
  return this.resultados.some(resultado => 
    resultado.estanteria.nombreEstanteria === nombreEstanteria &&
    resultado.fila === i && resultado.columna === j);
}

scrollToResultado(resultado: any) {
  const idCelda = 'celda-' + resultado.estanteria.nombreEstanteria + '-' + resultado.fila + '-' + resultado.columna;
  const resultadoElement = document.getElementById(idCelda);

  if (resultadoElement) {
    resultadoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  const idFila = 'fila-' + resultado.estanteria.nombreEstanteria + '-' + resultado.fila;
  const filaElement = document.getElementById(idFila);

  if (filaElement) {
    filaElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
regresar() {
  this.router.navigate(['/menu']); 
}
productoMalEstado() {
  this.router.navigate(['/producto-mal-estado-index']); 
}
}

