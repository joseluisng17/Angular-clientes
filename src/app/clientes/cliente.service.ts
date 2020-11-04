import { Injectable } from '@angular/core';
import { formatDate, DatePipe } from '@angular/common';
import { CLIENTES } from './clientes.json';
import { Cliente } from './cliente';
import { of, Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpRequest, HttpEvent } from '@angular/common/http';
import { map, catchError, tap } from 'rxjs/operators';
//import swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Region } from './region';
//import { AuthService } from '../usuarios/auth.service';

@Injectable()
export class ClienteService {

  private urlEndPoint: string = 'http://localhost:8080/api/clientes';

  // private httpHeaders = new HttpHeaders({'Content-type': 'application/json'});

  constructor(private http: HttpClient, private router: Router, /*private authService: AuthService*/) { }

  // En este caso comento la siguiente función ya que el token que paso por header lo hago por medio del token.interceptor
  /*private agregarAuthorizationHeader(){
    let token = this.authService.token;
    if(token != null){
      return this.httpHeaders.append('Authorization', 'Bearer ' + token);
    }
    return this.httpHeaders;
  }*/


  // el siguiente metodo lo comento por que ya tengo la validación en el interceptor auth.intecerptor.ts
  // metodo por si las rutas estan protegidas y ocupas estar logeado te redireccionen a login
  /*private isNoAutoizado(e): boolean{
    if(e.status==401){

      // si el token expira y estamos autenticados cerramos la sesión
      if(this.authService.isAuthenticated()){
        this.authService.logout();
      }
      
      this.router.navigate(['/login']);
      return true;
    }

    if(e.status==403){
      swal('Acceso denegado', `Hola ${this.authService.usuario.username} no tienes acceso a este recurso!`, 'warning');
      this.router.navigate(['/clientes']);
      return true;
    }

    return false;
  }*/

  getRegiones(): Observable<Region[]>{
    return this.http.get<Region[]>(this.urlEndPoint + '/regiones')/*.pipe(
      comento el pipe porque ya se implementa en el auth.interceptor.ts en caso de no utilizar el interceptor
      descomentar el pipe, descomentar la función isNoAutoizado y borrar estos comentarios.
      catchError( e => {
        this.isNoAutoizado(e);
        return throwError(e);
      })
    );*/
  }

  getClientes(page: number): Observable<any>{
    //return of(CLIENTES);
    
    // Esto es una forma de resolver la petición haciendo un casteo en el get poniendo el tipo de dato que vas a recibir
    //return this.http.get<Cliente[]>(this.urlEndPoint);

    //Esta es la otra forma de resolver la petición con un map
    return this.http.get(this.urlEndPoint+'/page/'+page).pipe(
      tap((response: any) => {
        //let clientes = response as Cliente[];
        console.log("Cliente service: tap 1");
        (response.content as Cliente[]).forEach( cliente => {
          console.log(cliente.nombre);
        })
      }),

      map( (response: any) => {
        (response.content as Cliente[]).map(cliente => {
          cliente.nombre = cliente.nombre.toUpperCase();
          //let datePipe = new DatePipe('es');  la creación de esta variable para la fecha localización la utilizamos en app.module para utilizarla de forma global
          // vamos a formatear la fecha en la vista de otro modo descomentar la siguiente linea de codigo
          //cliente.createAt = datePipe.transform(cliente.createAt, 'EEEE dd, MMMM yyyy');
          // segunda forma de formatear la fecha
          //cliente.createAt = formatDate(cliente.createAt, 'dd-MM-yyyy', 'en-US');
          return cliente;
        });
        return response;
      }),
      // la importancia del tap importa en el orden, por ejemplo en el primer tap hacer que el response se comporte como cliente, 
      //mientras en este tap, ya toma el cliente que retorna el map.
      tap( response => {
        console.log("ClienteService: tap 2");
        (response.content as Cliente[]).forEach( cliente => {
          console.log(cliente.nombre);
        })
      })
    );
  }

  create(cliente: Cliente) : Observable<Cliente>{
    return this.http.post(this.urlEndPoint, cliente, /*{headers: this.agregarAuthorizationHeader()}*/ ).pipe(
      // esto es una forma de resolver la respuesta que nos llega en un json que tiene varios valores que no son igual
      // a nuestro objeto Cliente, la otra forma de resolver es en el observable poner any ejemplo en la función de update
      map( (response: any) => response.cliente as Cliente),
      catchError(e => {

        // comprobamos que las rutas no esten protegidas y no devuelva un error 401 o 403 si así redirigue a login
        /*if(this.isNoAutoizado(e)){
          return throwError(e);
        }*/

        if(e.status == 400){
          return throwError(e);
        }

        if(e.error.mensaje){
          console.error(e.error.mensaje);
        }
        
        //swal(e.error.mensaje, e.error.error, 'error'); comento esta linea porque los mensaje de error del aler los manejo en auth.interceptor.ts
        return throwError(e);
      })  
    );
  }

  getCliente(id): Observable<Cliente>{
    return this.http.get<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {

        /*if(this.isNoAutoizado(e)){
          return throwError(e);
        }*/

        if(e.status != 401 && e.error.mensaje){
          this.router.navigate(['/clientes']);
          console.error(e.error.mensaje);
        }
        
        //swal('Error al editar', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

  // La forma de resolver nuestra respuesta cuando es un json que tiene varios valores y no es igual que nuestro
  // nuestra objeto Cliente es pasar en el observable un "any".
  update(cliente: Cliente): Observable<any>{
    return this.http.put<any>(`${this.urlEndPoint}/${cliente.id}`, cliente).pipe(
      catchError(e => {

        /*if(this.isNoAutoizado(e)){
          return throwError(e);
        }*/

        if(e.status == 400){
          return throwError(e);
        }
        
        if(e.error.mensaje){
          console.error(e.error.mensaje);
        }
        //swal(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })  
    );
  }

  delete(id: number): Observable<Cliente>{
    return this.http.delete<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {

        /*if(this.isNoAutoizado(e)){
          return throwError(e);
        }*/

        if(e.error.mensaje){
          console.error(e.error.mensaje);
        }
        //swal(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })  
    );
  }

  // forma de subir una imagen con una barra de progreso mientras se carga el archivo
  subirFoto(archivo: File, id): Observable<HttpEvent<{}>>{

    // la variable formData de tipo Objeto FormData es para poder enviar archivos por un formulario
    let formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("id", id);

    // no utilizo el siguiente codigo ya que los header se lo paso por medio de token.interceptor
    // pasamos el token al httpHeader, aquí no lo hacemos como en el metodo create, delete o update, ya que aquí estamos enviando una foto y se trabaja de forma distinta el httpRequest
    /*let httpHeaders = new HttpHeaders();
    let token = this.authService.token;
    if(token != null){
      httpHeaders = httpHeaders.append('Authorization', 'Bearer ' + token);
    }*/

    const req = new HttpRequest('POST', `${this.urlEndPoint}/upload`, formData, {
      reportProgress: true,
      //headers: httpHeaders
    });

    return this.http.request(req)/*.pipe(
      catchError( e => {
        if(this.isNoAutoizado(e)){
          return throwError(e);
        }
      })
    );*/
  }


  // Forma tradicional de subir una imagen
  /*subirFoto(archivo: File, id): Observable<Cliente>{

    // la variable formData de tipo Objeto FormData es para poder enviar archivos por un formulario
    let formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("id", id);

    return this.http.post(`${this.urlEndPoint}/upload`, formData).pipe(
      map( (response: any) => response.cliente as Cliente),
      catchError( e => {
        console.log(e.error.mensaje);
        swal(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }*/

}
