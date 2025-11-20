import { Component, OnInit } from '@angular/core';
import { LoginDTO } from '../../models/login';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    imports: [FormsModule, CommonModule],
})

export class LoginComponent implements OnInit{
    loginDTO: LoginDTO = new LoginDTO();
    isLoading: boolean=false;

    constructor(private service: AuthService, private router: Router) {}
    ngOnInit(): void {
      this.isLoading=true;
      this.service.isTokenValid().then((isValid) => {
    if (isValid) {
      if(this.service.getIdUnidad()) this.router.navigate(['/home']);
      this.isLoading=false;
    } else {
      this.isLoading = false;
    }
  }).catch(() => {
    this.isLoading = false;
  });
}

  onSubmit(login: NgForm): void {
    if (login.valid) {
      this.isLoading = true;
      this.service.login(this.loginDTO).subscribe({
        next: () => {
          // intentá validar hasta 3 veces con delay
          this.retryTokenValidation(3, 2000).then((isValid) => {
            if (isValid) {
              this.router.navigate(['/home']);
            } else {
              this.isLoading = false;
              Swal.fire({
                title: 'Error',
                text: 'Token inválido luego de iniciar sesión',
                icon: 'error',
              });
            }
          });
        },
        error: (err) => {
          this.isLoading = false;
          Swal.fire({
            title: 'Error',
            text: 'Cédula y/o Contraseña incorrecta',
            icon: 'error',
          });
        },
      });

      login.reset();
    }
  }
  private async retryTokenValidation(intentos: number, esperaMs: number): Promise<boolean> {
    for (let i = 0; i < intentos; i++) {
      const valido = await this.service.isTokenValid();
      if (valido) return true;
      await new Promise((res) => setTimeout(res, esperaMs));
    }
    return false;
  }
}
