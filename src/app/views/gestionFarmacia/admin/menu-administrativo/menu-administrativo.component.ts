import { Component, OnInit } from '@angular/core';
import { FirebaseRealTimeDatabaseService } from '../../../../services/firebase-Realtime-Database.service'; 
import { Chart,registerables } from 'chart.js'; 
import { NavbarComponent } from '../navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
Chart.register(...registerables);
@Component({
  selector: 'app-menu-administrativo',
  standalone: true,
  imports: [NavbarComponent,FormsModule,CommonModule],
  templateUrl: './menu-administrativo.component.html',
  styleUrl: './menu-administrativo.component.css'
})
export class MenuAdministrativoComponent implements OnInit{
  constructor(private firebaseService: FirebaseRealTimeDatabaseService) {}

  ngOnInit(): void {
    // Gráfico de barras (Estanterías)
    this.firebaseService.listado('estanterias').subscribe(estanterias => {
      const nombresEstanteria = estanterias.map((estanteria: any) => estanteria.nombreEstanteria);
      const cantidadesColumnas = estanterias.map((estanteria: any) => estanteria.cantidadColumnas);
  
      const chart = new Chart('myChart', {
        type: 'bar', // Gráfico de barras
        data: {
          labels: nombresEstanteria,
          datasets: [{
            label: 'Cantidad de Columnas',
            data: cantidadesColumnas,
            backgroundColor: [
              'rgba(173, 216, 230, 0.7)', // Azul pálido con opacidad
              'rgba(135, 206, 250, 0.7)', // Azul cielo claro
              'rgba(176, 224, 230, 0.7)', // Azul más claro
              'rgba(240, 248, 255, 0.7)', // Azul muy claro
              // Agregar más colores si es necesario
            ],
            borderColor: 'rgba(70, 130, 180, 1)', // Azul fuerte para los contornos
            borderWidth: 3, // Contornos más gruesos
            hoverBackgroundColor: 'rgba(70, 130, 180, 0.8)', // Hover color (más oscuro)
            hoverBorderColor: 'rgba(70, 130, 180, 1)', // Hover border color
            hoverBorderWidth: 4, // Hover border width
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              ticks: {
                font: {
                  size: 14, // Tamaño de fuente en el eje X
                  weight: 'bold',
                  family: 'Arial, sans-serif'
                },
                color: '#333', // Color de las etiquetas en el eje X
              },
              grid: {
                color: '#ddd' // Color de las líneas de la cuadrícula en el eje X
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                font: {
                  size: 14,  // Tamaño de fuente en el eje Y
                  weight: 'bold',
                  family: 'Arial, sans-serif'
                },
                color: '#333', // Color de las etiquetas en el eje Y
              },
              grid: {
                color: '#ddd' // Color de las líneas de la cuadrícula en el eje Y
              }
            }
          },
          plugins: {
            legend: {
              labels: {
                font: {
                  size: 16, // Tamaño de la fuente de la leyenda
                  weight: 'bold',
                  family: 'Arial, sans-serif'
                },
                color: '#333'  // Color de la fuente de la leyenda
              }
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',  // Color de fondo del tooltip
              titleColor: '#fff',   // Color del título en el tooltip
              bodyColor: '#fff',    // Color del cuerpo del tooltip
              borderColor: '#fff',  // Color del borde del tooltip
              borderWidth: 1
            }
          }
        }
      });
      
    });
  
    // Gráfico de pastel (Productos en mal estado)
    this.firebaseService.listado('productosMalEstado').subscribe(productos => {
      const nombresMedicamentos = productos.map((producto: any) => producto.producto);
      const cantidades = productos.map((producto: any) => producto.cantidad);
    
      const chart2 = new Chart('myPieChart', {
        type: 'pie', // Gráfico de tipo pastel
        data: {
          labels: nombresMedicamentos,
          datasets: [{
            data: cantidades,
            backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33F6'], // Colores vivos
            borderColor: '#fff', // Color del borde de los segmentos
            borderWidth: 2,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false // Oculta la leyenda completa
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem: any) => {
                  const label = nombresMedicamentos[tooltipItem.dataIndex];
                  const value = cantidades[tooltipItem.dataIndex];
                  return `${label}: ${value}`; // Personaliza el texto del tooltip
                }
              },
              backgroundColor: 'rgba(0, 0, 0, 0.7)', // Color de fondo del tooltip
              titleColor: '#fff', // Color del título en el tooltip
              bodyColor: '#fff', // Color del cuerpo del tooltip
              borderColor: '#fff', // Color del borde del tooltip
              borderWidth: 1
            }
          }
        }
      });
    });
  }    
}
