import { Component, OnInit } from '@angular/core';
import { Cliente } from './cliente';
import { ClienteService } from './cliente.service';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { Region } from './region';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {

  private cliente: Cliente = new Cliente()
  regiones: Region[]
  private titulo: string = "Crear cliente";
  private errores: string[];

  constructor(private clienteService : ClienteService, private router: Router, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.cargarCliente();
    this.clienteService.getRegiones().subscribe(regiones => this.regiones = regiones);
  }

  cargarCliente(): void{
    // para usar activatedRoute lo importamos arriba y tambien lo pasamos en el contrusctor
    // utilizo activatedRute para obtener los parametros de la url
    this.activatedRoute.params.subscribe(params => {
      let id = params['id']
      if(id){
        this.clienteService.getCliente(id).subscribe((cliente) => this.cliente = cliente)
      }
    })
  }

  public create(): void{
    this.clienteService.create(this.cliente)
      .subscribe(cliente => {
        // para hacer uso de route.navigate y navegar a otra ruta importamos router de angular/router en la parte de arriba.
        // y tambien lo pasamos en le constructor
        this.router.navigate(['/clientes'])
        swal('Nuevo Cliente', `El cliente ${cliente.nombre} ha sido creado con éxito`, 'success')
      },
      err => {
        this.errores = err.error.errors as string[];
        console.log('Codigo del error desde el backend: ' + err.status);
        console.log(err.error.errors);
      }
    );  
  }

  // en esta función en la respuesta suscribe ponemos json por que en la función update en la clase ClienteService
  // estamos usando un any en el observable para hacer mas flexible la respuesta y recibir todo los datos del json.
  update():void{
    this.clienteService.update(this.cliente)
      .subscribe( json => {
        this.router.navigate(['/clientes'])
        swal('Cliente Actualizado', `${json.mensaje}: ${json.cliente.nombre}`, 'success')
      },
      err => {
        this.errores = err.error.errors as string[];
        console.log('Codigo del error desde el backend: ' + err.status);
        console.log(err.error.errors);
      }
    )
  }

  compararRegion(o1: Region, o2: Region): boolean{
    if(o1 === undefined && o2 === undefined){
      return true
    }
    return o1 === null || o2 === null || o1 === undefined || o2 === undefined ? false : o1.id === o2.id;
  }

}
