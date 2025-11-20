import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { UsuariosComponent } from './components/usuarios/usuarios.component';
import { TipoEquipoComponent } from './components/maquina/tab/tipo/tipo-equipo.component';
import { TabEquipos } from './components/maquina/tab/tab.component';
import { UnidadComponent } from './components/configuracion/Unidades/unidad.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './services/auth.guard';
import { GradoComponent } from './components/configuracion/grados/grado.component';
import { TramitesComponent } from './components/tramites/tramite.component';
import { MantenimientosComponent } from './components/mantenimientos/mantenimiento.component';


export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/home',
    },
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: 'home',
        component: HomeComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'tramites',
        component: TramitesComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'usuarios',
        component: UsuariosComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'tipos',
        component: TipoEquipoComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'tabEquipos',
        component: TabEquipos,
        canActivate: [AuthGuard],
    },
    {
        path: 'unidades',
        component: UnidadComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'grados',
        component: GradoComponent,
        canActivate: [AuthGuard],
    },  
    {
        path: 'mantenimientos',
        component: MantenimientosComponent,
        canActivate: [AuthGuard],
    }
];
