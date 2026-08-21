import { Routes } from '@angular/router';
import { ListaProductoMalEstadoComponent } from '../app/views/gestionFarmacia/admin/productoMalEstado/lista-producto-mal-estado/lista-producto-mal-estado.component';
import { CrearProductoMalEstadoComponent } from '../app/views/gestionFarmacia/admin/productoMalEstado/crear-producto-mal-estado/crear-producto-mal-estado.component';
import { EditarProductoMalEstadoComponent } from '../app/views/gestionFarmacia/admin/productoMalEstado/editar-producto-mal-estado/editar-producto-mal-estado.component';
import { ProductoMalEstadoIndexComponent } from '../app/views/gestionFarmacia/public/productoMalEstado/producto-mal-estado-index/producto-mal-estado-index.component';
import { MenuComponent } from '../app/views/gestionFarmacia/public/menu/menu.component';
import { ListaEstanteriaComponent } from '../app/views/gestionFarmacia/admin/estanteria/lista-estanteria/lista-estanteria.component';
import { CrearEstanteriaComponent } from '../app/views/gestionFarmacia/admin/estanteria/crear-estanteria/crear-estanteria.component';
import { EditarEstanteriaComponent } from '../app/views/gestionFarmacia/admin/estanteria/editar-estanteria/editar-estanteria.component';
import { CrudEstanteriaComponent } from '../app/views/gestionFarmacia/admin/estanteria/crud-estanteria/crud-estanteria.component';
import { NavbarComponent } from '../app/views/gestionFarmacia/admin/navbar/navbar.component';
import { EstanteriaComponent } from '../app/views/gestionFarmacia/public/estanteria/estanteria.component';
import { ClientePlanMedicoComponent } from '../app/views/gestionFarmacia/public/clientePlanMedico/cliente-plan-medico/cliente-plan-medico.component';
import { MenuAdministrativoComponent } from '../app/views/gestionFarmacia/admin/menu-administrativo/menu-administrativo.component';
import { InventarioProductoMalEstadoComponent } from '../app/views/gestionFarmacia/admin/productoMalEstado/inventario-producto-mal-estado/inventario-producto-mal-estado.component';
import { ListaClientePlanMedicoComponent } from '../app/views/gestionFarmacia/admin/clientesPlanesMedicos/lista-cliente-plan-medico/lista-cliente-plan-medico.component';
import { CrearClientePlanMedicoComponent } from '../app/views/gestionFarmacia/admin/clientesPlanesMedicos/crear-cliente-plan-medico/crear-cliente-plan-medico.component';
import { EditarClientePlanMedicoComponent } from '../app/views/gestionFarmacia/admin/clientesPlanesMedicos/editar-cliente-plan-medico/editar-cliente-plan-medico.component';

import { LoginprosystemComponent } from '../app/views/Personal/loginprosystem/loginprosystem.component';
import { FinanzasProsystemComponent } from '../app/views/Personal/finanzas-prosystem/finanzas-prosystem.component';

import { ControlcontableComponent } from '../app/views/gestionFarmacia/admin/controlcontable/controlcontable.component';
import { ControlcontablepcComponent } from '../app/views/gestionFarmacia/public/controlcontablepc/controlcontablepc.component';



import { LoginComponent } from './views/autenticacion/login/login.component';
import { AuthGuard } from './services/firebase-guard.service';
import { InventarioDiarioComponent } from './views/gestionFarmacia/public/inventario-diario/inventario-diario.component';

export const routes: Routes = [
    { path: '', redirectTo: '/menu', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'loginprosystem', component: LoginprosystemComponent },
    //ADMIN
    { path: 'lista-producto-mal-estado', component: ListaProductoMalEstadoComponent, canActivate: [AuthGuard] },
    { path: 'crear-producto-mal-estado', component: CrearProductoMalEstadoComponent, canActivate: [AuthGuard] },
    { path: 'editar-producto-mal-estado/:id', component: EditarProductoMalEstadoComponent, canActivate: [AuthGuard] },
    { path: 'lista-estanteria', component: ListaEstanteriaComponent, canActivate: [AuthGuard] },
    { path: 'crear-estanteria', component: CrearEstanteriaComponent, canActivate: [AuthGuard] },
    { path: 'editar-estanteria/:id', component: EditarEstanteriaComponent, canActivate: [AuthGuard] },
    { path: 'crud-estanteria', component: CrudEstanteriaComponent, canActivate: [AuthGuard] },
    { path: 'navbar', component: NavbarComponent, canActivate: [AuthGuard] },
    { path: 'menu-administrativo', component: MenuAdministrativoComponent, canActivate: [AuthGuard] },
    { path: 'inventario-producto-mal-estado', component: InventarioProductoMalEstadoComponent, canActivate: [AuthGuard] },
    { path: 'lista-cliente-plan-medico', component: ListaClientePlanMedicoComponent, canActivate: [AuthGuard] },
    { path: 'crear-cliente-plan-medico', component: CrearClientePlanMedicoComponent, canActivate: [AuthGuard] },
    { path: 'editar-cliente-plan-medico/:id', component: EditarClientePlanMedicoComponent, canActivate: [AuthGuard] },
    { path: 'controlcontable', component: ControlcontableComponent, canActivate: [AuthGuard] },

    { path: 'finanzasprosystem', component: FinanzasProsystemComponent, canActivate: [AuthGuard] },

    //PUBLIC
    { path: 'producto-mal-estado-index', component: ProductoMalEstadoIndexComponent },
    { path: 'estanteria', component: EstanteriaComponent },
    { path: 'cliente-plan-medico', component: ClientePlanMedicoComponent },
    { path: 'controlcontablepc', component: ControlcontablepcComponent },
    { path: 'inventario-diario', component: InventarioDiarioComponent },
    { path: 'menu', component: MenuComponent },

];
