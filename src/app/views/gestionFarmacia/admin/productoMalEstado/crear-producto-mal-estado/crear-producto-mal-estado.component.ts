import { Component,OnInit } from '@angular/core';
import { FirebaseRealTimeDatabaseService } from '../../../../../services/firebase-Realtime-Database.service'; 
import { FirebaseAuthService } from '../../../../../services/firebase-auth.service'; 
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { alertResultado,alertCodigoExistente } from '../../../../../services/utils';
import { NavbarComponent } from '../../navbar/navbar.component';



@Component({
  selector: 'app-crear-producto-mal-estado',
  standalone: true,
  imports: [CommonModule,FormsModule,NavbarComponent],
  templateUrl: './crear-producto-mal-estado.component.html',
  styleUrl: './crear-producto-mal-estado.component.css'
})
export class CrearProductoMalEstadoComponent implements OnInit {
  mensajeInsertado = false; 
  autenticado: boolean = false;
  producto: string = '';
  cantidad: number = 0;
  descripcion: string = '';
  codigo: string = '';
  bulkData: string = ''; // Para almacenar los datos en formato tabular
  datosProcesados: any[] = []; // Para almacenar los datos procesados
  constructor(
    private firebaseRealtimeDatabaseService: FirebaseRealTimeDatabaseService,
    private authService: FirebaseAuthService,
    private router:Router 
  ) {}

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.autenticado = true; 
      } else {
        this.router.navigate(['/login']); 
      }
    });
  }
  async insertar() {
    const rutaRedireccion = '/crear-producto-mal-estado';
    const carpeta = "productosMalEstado";
    const datos = {
      producto: this.producto,
      cantidad: this.cantidad,
      descripcion: this.descripcion,
      codigo: this.codigo
    };
  
    try {
      const existe = await this.firebaseRealtimeDatabaseService.verificarCodigoExistente(carpeta, this.codigo).toPromise();
      if (existe) {
        alertCodigoExistente();
      } else {
        alertResultado('crear', this.producto, () => this.firebaseRealtimeDatabaseService.insertar(carpeta, datos), rutaRedireccion);
      }
    } catch (error) {
      console.error('Error al verificar el código:', error);
    }
  }
  
  procesarDatos() {
    this.datosProcesados = []; 
    const lineas = this.bulkData.split('\n').filter(linea => 
      linea.trim() !== '' && !/^=+$/.test(linea)
    );
  
    console.log('Líneas después de limpieza:', lineas); // Verificar las líneas después de limpiar
  
    // Variable para almacenar las filas procesadas
    const datosLimpios: string[] = [];
  
    // Procesamos cada línea
    lineas.forEach((linea, index) => {
      console.log(`Procesando línea ${index + 1}:`, linea); // Ver qué línea se está procesando
  
      const regex = /(\d{7,})\s+([A-Za-z0-9\s\*]+(?:\s+[A-Za-z0-9\s\*]+)*)\s+([A-Za-z]{2,})\s+([A-Za-z]{1,})\s+(\d+(\.\d{1,2})?)\s+(\d+(\.\d{1,2})?)\s+(\d+(\.\d{1,2})?)/;
  
      const match = linea.trim().match(regex);
      console.log('Resultado de la expresión regular:', match);
  
      if (match) {
        const codigo = match[1] ? match[1].trim() : '';
        const producto = match[2] ? match[2].trim() : '';
        const generico = match[3] ? match[3].trim() : '';
        const umedida = match[4] ? match[4].trim() : '';
        const cantidad = match[5] ? parseFloat(match[5].trim()) : 0;
        const subTotal = match[6] ? parseFloat(match[6].trim()) : 0; // Subtotal antes del descuento
        const descuento = match[7] ? parseFloat(match[7].trim()) : 0;
        const total = match[8] ? parseFloat(match[8].trim()) : 0;
  
        console.log('Datos extraídos:', codigo, producto, generico, umedida, cantidad, subTotal, descuento, total);
  
        if (codigo && producto && cantidad > 0) {
          const cantidadFormateada = cantidad.toFixed(2);
          const lineaLimpia = `${codigo} | ${producto} | ${cantidadFormateada}`;
          datosLimpios.push(lineaLimpia);
  
          this.datosProcesados.push({ codigo, producto, generico, umedida, cantidad, subTotal, descuento, total });
        } else {
          console.log(`Línea ignorada (falta información):`, linea);
        }
      } else {
        console.log(`No se pudo procesar la línea:`, linea); 
      }
    });
    if (datosLimpios.length === 0) {
      alert('No se encontraron datos válidos. Revisa el formato del texto.');
    } else {
      this.bulkData = datosLimpios.join('\n');
    }
  }
  guardarDatos() {
    if (this.datosProcesados.length === 0) {
      console.warn('No hay datos procesados para guardar.');
      return;
    }
  
    const carpeta = "productosMalEstado";
    this.datosProcesados.forEach((dato) => {
      const datosAGuardar = {
        codigo: dato.codigo,
        producto: dato.producto,
        cantidad: dato.cantidad,
        descripcion: "Descripción no disponible"
      };
      
      // Guardamos los datos en la base de datos
      this.firebaseRealtimeDatabaseService.insertar(carpeta, datosAGuardar).then(() => {
        console.log(`Datos de ${dato.producto} guardados exitosamente`);
      }).catch(error => {
        console.error(`Error al guardar los datos de ${dato.producto}:`, error);
      });
    });
  
    // Llamamos a la función SweetAlert para mostrar el mensaje de éxito
    alertResultado(
      'crear', // Acción: 'crear' porque estamos insertando nuevos datos
      'productos mal estado', // Título que se muestra en el alert
      () => Promise.resolve(), // Aquí se pasa una función dummy que siempre resuelve
      '/lista-producto-mal-estado' 
    );
    this.datosProcesados = [];
  }
  
  
  regresar() {
    this.router.navigate(['/lista-producto-mal-estado']); 
  }
}
