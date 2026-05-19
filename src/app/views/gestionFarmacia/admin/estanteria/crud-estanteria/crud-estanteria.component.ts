import { Component, OnInit } from '@angular/core';
import { FirebaseRealTimeDatabaseService } from '../../../../../services/firebase-Realtime-Database.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { alertEliminar } from '../../../../../services/utils';

@Component({
  selector: 'app-crud-estanteria',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './crud-estanteria.component.html',
  styleUrls: ['./crud-estanteria.component.css']
})
export class CrudEstanteriaComponent implements OnInit {
  
  estanterias: any[] = [];
  ubicaciones: any[] = [];
  isEditing: { [key: string]: boolean } = {};
  newUbicacion: { [key: string]: string } = {};
  editingId: { [key: string]: string } = {}; // Almacena el ID del registro en edición
  busqueda: string = '';  // Variable para almacenar la búsqueda
  resultados: any[] = [];
  resultadoActual: any = null; // Almacena el resultado actual
  esPantallaGrande: boolean = window.innerWidth > 1024; // Inicializa con el tamaño actual

  constructor(private firebaseService: FirebaseRealTimeDatabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.obtenerEstanterias();
    this.detectarPantalla(); // Detecta el tamaño inicial
    window.addEventListener('resize', this.detectarPantalla.bind(this));
  }
  ngOnDestroy() {
    window.removeEventListener('resize', this.detectarPantalla.bind(this)); // Limpia el listener
  }

  detectarPantalla() {
    this.esPantallaGrande = window.innerWidth > 1024;
  }
  obtenerEstanterias() {
    this.firebaseService.listado('estanterias').subscribe(
      (data) => {
        this.estanterias = data.map((estanteria) => ({
          ...estanteria,
          nombreEstanteria: estanteria.nombreEstanteria, // Agregar el texto al nombre
        })).sort((a, b) => {
          const numA = parseInt(a.nombreEstanteria.split(' ')[1], 10);
          const numB = parseInt(b.nombreEstanteria.split(' ')[1], 10);
          return numA - numB;
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
    
    // Si la pantalla es grande y la estantería tiene rotación, invertimos las columnas
    if (this.esPantallaGrande && estanteriasConRotacion.some(criterio => nombreEstanteria.toUpperCase().includes(criterio))) {
      const totalColumnas = Math.max(...this.ubicaciones
        .filter(u => u.nombreEstanteria === nombreEstanteria)
        .map(u => u.columna));
      columnaBuscada = totalColumnas - j; // Calculamos la columna invertida
    }
    
    // Buscamos la ubicación utilizando la columna calculada
    const ubicacion = this.ubicaciones.find(ubicacion =>
      ubicacion.fila === (i + 1) &&
      ubicacion.columna === columnaBuscada &&
      ubicacion.nombreEstanteria === nombreEstanteria
    );
  
    return ubicacion ? ubicacion.dato : ''; // Devolvemos el dato si existe
  }
  
  // obtenerDatoCelda(i: number, j: number, nombreEstanteria: string): string {
  //   let columnaBuscada = j + 1;
  //   const estanteriasConRotacion = ['ESTANTERÍA 1 [ENFRENTE]', 'ESTANTERÍA 2 [ENFRENTE]','ESTANTERÍA 5 [ATRÁS]'];
  //   const esPantallaGrande = window.innerWidth > 1024;

  //   // Verificamos si la estantería tiene rotación
  //   if (
  //     esPantallaGrande && 
  //     estanteriasConRotacion.some(criterio => nombreEstanteria.toUpperCase().includes(criterio))
  //   ) {
  //     const totalColumnas = Math.max(...this.ubicaciones
  //       .filter(u => u.nombreEstanteria === nombreEstanteria)
  //       .map(u => u.columna));
  //     // La columna se calcula en función de la rotación
  //     columnaBuscada = totalColumnas - j;
  //   }

  //   const ubicacion = this.ubicaciones.find(ubicacion =>
  //     ubicacion.fila === (i + 1) &&
  //     ubicacion.columna === columnaBuscada &&
  //     ubicacion.nombreEstanteria === nombreEstanteria
  //   );

  //   return ubicacion ? ubicacion.dato : '';
  // }

  

  ubicacionExistente(i: number, j: number, nombreEstanteria: string): boolean {
    const columna = this.calcularColumna(i, j, nombreEstanteria);
    return this.ubicaciones.some(ubicacion =>
      ubicacion.fila === (i + 1) &&
      ubicacion.columna === columna &&
      ubicacion.nombreEstanteria === nombreEstanteria
    );
  }
  // calcularColumna(i: number, j: number, nombreEstanteria: string): number {
  //   let columna = j + 1;
  //   const estanteriasConRotacion = ['ESTANTERÍA 1 [ENFRENTE]', 'ESTANTERÍA 2 [ENFRENTE]', 'ESTANTERÍA 5 [ATRÁS]'];

  //   if (estanteriasConRotacion.some(criterio => nombreEstanteria.toUpperCase().includes(criterio))) {
  //     const totalColumnas = Math.max(...this.ubicaciones
  //       .filter(u => u.nombreEstanteria === nombreEstanteria)
  //       .map(u => u.columna));
  //     columna = totalColumnas - j;
  //   }

  //   return columna;
  // }

  calcularColumna(i: number, j: number, nombreEstanteria: string): number {
    let columna = j + 1;
    const estanteriasConRotacion = ['ESTANTERÍA 1 [ENFRENTE]', 'ESTANTERÍA 2 [ENFRENTE]', 'ESTANTERÍA 5 [ATRÁS]'];
  
    // Solo rotamos la columna si es una pantalla grande y la estantería tiene rotación
    if (this.esPantallaGrande && estanteriasConRotacion.some(criterio => nombreEstanteria.toUpperCase().includes(criterio))) {
      const totalColumnas = Math.max(...this.ubicaciones
        .filter(u => u.nombreEstanteria === nombreEstanteria)
        .map(u => u.columna));
      columna = totalColumnas - j; // Columna invertida
    }
  
    return columna;
  }
  
  
  crearCelda(i: number, j: number, nombreEstanteria: string) {
    const key = `${i}-${j}-${nombreEstanteria}`;
    this.isEditing[key] = true;
    this.newUbicacion[key] = '';
    this.editingId[key] = ''; // Vaciar el ID para un nuevo registro
  }

  editarCelda(i: number, j: number, nombreEstanteria: string) {
    const key = `${i}-${j}-${nombreEstanteria}`;
    const columna = this.calcularColumna(i, j, nombreEstanteria);

    const ubicacion = this.ubicaciones.find(ubicacion =>
      ubicacion.fila === (i + 1) &&
      ubicacion.columna === columna &&
      ubicacion.nombreEstanteria === nombreEstanteria
    );

    if (ubicacion) {
      this.isEditing[key] = true;
      this.newUbicacion[key] = ubicacion.dato;
      this.editingId[key] = ubicacion.id; // Almacenar el ID del registro en edición
    } else {
      alert('No hay datos en esta celda para editar');
    }
  }

  guardarUbicacion(i: number, j: number, nombreEstanteria: string) {
    const key = `${i}-${j}-${nombreEstanteria}`;
    const columna = this.calcularColumna(i, j, nombreEstanteria);

    const ubicacion = {
      fila: i + 1,
      columna: columna,
      nombreEstanteria: nombreEstanteria,
      dato: this.newUbicacion[key]
    };

    if (this.editingId[key]) {
      const id = this.editingId[key];
      this.firebaseService.editar('ubicacionesEstanterias', { ...ubicacion, id })
        .then(() => {
          console.log('Ubicación actualizada');
          this.isEditing[key] = false;
          this.actualizarUbicaciones(); // Refrescar las ubicaciones
        })
        .catch((error) => {
          console.error('Error al actualizar ubicación:', error);
        });
    } else {
      // Crear un nuevo registro
      this.firebaseService.insertar('ubicacionesEstanterias', ubicacion)
        .then(() => {
          console.log('Ubicación creada');
          this.isEditing[key] = false;
          this.actualizarUbicaciones(); // Refrescar las ubicaciones
        })
        .catch((error) => {
          console.error('Error al guardar ubicación:', error);
        });
    }
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
  eliminarCelda(i: number, j: number, nombreEstanteria: string) {
    const columna = this.calcularColumna(i, j, nombreEstanteria);
  
    const ubicacion = this.ubicaciones.find(ubicacion =>
      ubicacion.fila === (i + 1) &&
      ubicacion.columna === columna &&
      ubicacion.nombreEstanteria === nombreEstanteria
    );
  
    if (ubicacion) {
      alertEliminar(
        () => this.firebaseService.eliminar(ubicacion.id, 'ubicacionesEstanterias'),
        `Ubicación en fila ${i + 1}, columna ${columna}`,
        '/crud-estanteria'
      );
    } else {
      alert('No hay datos en esta celda para eliminar');
    }
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
  
    // Desplazar la fila completa si es necesario
    const idFila = 'fila-' + resultado.estanteria.nombreEstanteria + '-' + resultado.fila;
    const filaElement = document.getElementById(idFila);
  
    if (filaElement) {
      filaElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  regresar() {
    this.router.navigate(['/menu-administrativo']);
  }

}
