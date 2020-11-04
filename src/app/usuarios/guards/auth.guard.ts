import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router){}

  // con el Guard es una capa más arriba apra proteger rutas, es decir primero comprobamos si esta autenticado y si no esta auntenticado
  // lo manda al login y así evitamos que haga una petición al Endpoint y el Endpoint nos retorne un error 401 o 403 que indica que no tenemos permisos que tenemos que logearnos
  // entonces así evitamos hacer peticiones que necesitan estar logeados y el guar nos indica que nos logemos antes y otimizamos peticiones al servidor.
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      if(this.authService.isAuthenticated()){
        if(this.isTokenExpirado()){
          this.authService.logout();
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      }
      this.router.navigate(['/login']);
      return false;
  }

  isTokenExpirado(): boolean {
    let token = this.authService.token;
    let payload = this.authService.obtenerDatostoken(token);
    let now = new Date().getTime() / 1000;
    if(payload.exp < now){
      return true;
    }
    return false;
  }

}
