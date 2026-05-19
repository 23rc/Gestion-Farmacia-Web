import { Component, OnInit } from '@angular/core';
import { FirebaseRealTimeDatabaseService } from '../../../../../services/firebase-Realtime-Database.service';
import { FirebaseAuthService } from '../../../../../services/firebase-auth.service';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { alertResultado } from '../../../../../services/utils';
import { NavbarComponent } from '../../navbar/navbar.component';


@Component({
  selector: 'app-editar-cliente-plan-medico',
  standalone: true,
  imports: [FormsModule,CommonModule,NavbarComponent],
  templateUrl: './editar-cliente-plan-medico.component.html',
  styleUrl: './editar-cliente-plan-medico.component.css'
})
export class EditarClientePlanMedicoComponent implements OnInit {
  autenticado: boolean = false;
  nombre: string = '';
  dpi: string = '';
  nit: string = '';
  celular: string = '';
  correo: string = '';
  clave: string = '';
  medicamento: string = '';
  laboratorio: string = '';
  id: string = '';

  constructor(
    private firebaseRealtimeDatabaseService: FirebaseRealTimeDatabaseService,
    private authService: FirebaseAuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    if (this.id) {
      this.cargarProducto(this.id);
    }
  }
  
  cargarProducto(id: string) {
    const carpeta = "clientesPlanMedico";
    this.firebaseRealtimeDatabaseService.obtenerPorId(id,carpeta).subscribe(producto => {
      if (producto) {
        this.nombre = producto.nombre;
        this.dpi = producto.dpi;
        this.nit = producto.nit;
        this.celular = producto.celular;
        this.correo = producto.correo;
        this.clave = producto.clave;
        this.medicamento = producto.medicamento;
        this.laboratorio = producto.laboratorio;
      }
    });
  }

  editar() {
    const rutaRedireccion ="/lista-cliente-plan-medico";
    const carpeta = "clientesPlanMedico";
    const datos ={
      id: this.id,
      nombre : this.nombre,
      dpi :this.dpi,
      nit :this.nit,
      celular :this.celular,
      correo :this.correo,
      clave :this.clave,
      medicamento :this.medicamento,
      laboratorio: this.laboratorio
    }
    alertResultado('editar', this.nombre, () => this.firebaseRealtimeDatabaseService.editar(carpeta,datos), rutaRedireccion);
  }
  regresar() {
    this.router.navigate(['/lista-cliente-plan-medico']); 
  }
}
