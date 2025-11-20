import {
    Component,
    EventEmitter,
    Output,
    Input,
    SimpleChanges,
    OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Grado } from '../../../models/grado';
import { Unidad } from '../../../models/Unidad';
import { AuthService } from '../../../services/auth.service';
import { Rol } from '../../../models/enum/Rol';

@Component({
    selector: 'app-usuario-form',
    imports: [CommonModule, FormsModule],
    templateUrl: './usuario-form.component.html',
})
export class UsuarioFormComponent implements OnInit {
    @Input() usuario: any = {};
    @Input() rolesOriginal!: { key: string; label: string }[];
    @Input() unidades!: Unidad[];
    @Input() grados!: Grado[];
    roles!: { key: string; label: string }[];
    isLoadingg!:boolean;

    @Output() cerrar = new EventEmitter<void>();
    @Output() guardarUsuario = new EventEmitter<any>();
    noPermitirEditarRol = false;
    noPermitirEditarUnidad = false;

    constructor(private authService: AuthService) {}
    ngOnInit(): void {
        this.isLoadingg=true;
        setTimeout(() => {
            this.isLoadingg = false;
            }, 1500);
    }

ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuario'] && this.usuario) {
        
        let rol = this.authService.getRol()
        let idUsuario = this.authService.getIdUsuario();
        let idUnidad=this.authService.getIdUnidad();

        this.usuario.idUnidad ??= null;
        this.usuario.idGrado ??= null;
        this.usuario.rol ??= '';

            if (this.usuario.grado != null) {
                this.usuario.idGrado = this.usuario.grado.id;
            }

            if (this.usuario.unidad != null) {
                this.usuario.idUnidad = this.usuario.unidad.id;
            }

            if(rol != 'ROLE_BRIGADA' && rol != 'ROLE_ADMINISTRADOR'){
                this.noPermitirEditarRol=true;
                this.noPermitirEditarUnidad=true;
                if(this.usuario?.id==null||this.usuario.id==0){
                    this.usuario.idUnidad=idUnidad;
                    const unidadEncontrada = this.unidades.find(u => u.id === idUnidad);
                    if (unidadEncontrada) {
                    this.usuario.unidad = unidadEncontrada;
                    }
                    this.usuario.rol='UNIDAD';
                }
            }

            if (rol == 'ROLE_BRIGADA' && idUsuario != this.usuario.id) {
                this.roles = [...this.rolesOriginal.filter(x => x.key != 'ADMINISTRADOR' && x.key != 'BRIGADA')];
            } else{
                this.roles=[...this.rolesOriginal]
            }

            if (idUsuario == this.usuario.id) {
                this.noPermitirEditarRol = true;
                if (this.authService.getRol() != 'ROLE_ADMINISTRADOR') {
                    this.noPermitirEditarUnidad = true;
                }
            }
    }
}

    onSubmit() {
        this.guardarUsuario.emit(this.usuario);
    }

    onCancel() {
        this.cerrar.emit();
    }
}
