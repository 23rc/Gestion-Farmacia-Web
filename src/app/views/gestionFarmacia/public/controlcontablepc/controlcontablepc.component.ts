import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseRealTimeDatabaseService } from '../../../../services/firebase-Realtime-Database.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-controlcontablepc',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './controlcontablepc.component.html',
  styleUrl: './controlcontablepc.component.css'
})
export class ControlcontablepcComponent implements OnInit {
carpeta = 'controlContable';

  contenedor: any[] = [];
  contenedorFiltrado: any[] = [];

  totalEntradas = 0;
  totalSalidas = 0;
  balance = 0;
  totalMovimientos = 0;

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

}
