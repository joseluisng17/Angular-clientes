import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router){}

  // con el Guard es una capa más arriba apra proteger rutas, es decir primero comprobamos si esta autenticado y si no esta auntenticado
  // lo manda al login y así evitamos que haga una petición al Endpoint y el Endpoint nos retorne un error 401 o 403 que indica que no tenemos permisos que tenemos que logearnos
  // entonces así evitamos hacer peticiones que necesitan estar logeados y el guar nos indica que nos logemos antes y otimizamos peticiones al servidor.
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

      if(!this.authService.isAuthenticated()){
        this.router.navigate(['/login']);
        return false;
      }
      
      let role = next.data['role'] as string;
      console.log(role);
      if(this.authService.hasRole(role)){
        return true;
      }
      
      swal('Acceso denegado', `Hola ${this.authService.usuario.username} no tienes acceso a este recurso!`, 'warning');
      this.router.navigate(['/clientes']);
      return false;
  }
  
}
