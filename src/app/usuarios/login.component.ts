import { Component, OnInit } from '@angular/core';
import { Usuario } from './usuario';
import swal from 'sweetalert2';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  titulo: string = 'Por favor Sing In!';
  usuario: Usuario;

  constructor(private authService: AuthService, private router: Router) { 
    this.usuario = new Usuario();
  }

  ngOnInit() {
    if(this.authService.isAuthenticated()){
      swal('Login', `Hola ${this.authService.usuario.username} ya estás autenticado!`, 'info');
      this.router.navigate(['/clientes']);
    }

  }

  login(): void{
    console.log(this.usuario);
    if(this.usuario.username == null || this.usuario.password == null){
      swal('Error login', 'Username o passwod vacías!', 'error');
      return;
    }

    this.authService.login(this.usuario).subscribe(response => {
      //console.log(response);
     
      this.authService.guardarUsuario(response.access_token);
      this.authService.guardarToken(response.access_token);
      let usuario = this.authService.usuario;

      this.router.navigate(['/clientes']);
      swal('Login', `Hola ${usuario.username}, has iniciado sesión con éxito!`, 'success');
    }, err => {
      if(err.status == 400){
        swal('Error login', 'Usuario o clave incorrectas!', 'error');
      }
    }
    );
  }

}
