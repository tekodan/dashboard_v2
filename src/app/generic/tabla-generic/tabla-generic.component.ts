import { Component, OnInit, ViewChild, Output, EventEmitter, Inject, Input, Injector } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Usuario } from '../../modelos/usuario';
import { GenericServices } from '../../servicios/genericServices.services';
import { plainToClass } from "class-transformer";
import { Rol } from '../../modelos/rol';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogConfirmacionGenericComponent } from './dialog.confirmgeneric.component';
import { PathLocationStrategy, LocationStrategy } from '@angular/common';
import { ExcepcionService } from '../../servicios/excepcionServices.services';
import { ArrayOne } from './arrayone.pipe';
import { Router } from '@angular/router';


@Component({
  selector: 'app-tabla-generic',
  templateUrl: './tabla-generic.component.html',
  styleUrls: ['./tabla-generic.component.scss'],
  providers: [GenericServices, ExcepcionService,ArrayOne],



})
export class TablaGenericComponent implements OnInit {

  //Cabeceras de las columnas
  //cabecerasColumnas: string[] = [];


  //for (let i = 0; i < this.usuarios.length; i++) {
//    console.log(this.respuesta.users[i].roles);
  //  this.usuarios[i].setRoles(this.respuesta.users[i].roles);


  //}

  cabecerasColumnas: string[] = [];
  etiquetasColumnas:any[]=[];
  title:string="Algo";
  //variable de entrada de texto del imput buscar(cedula o nombre)
  filtroNombreCedula: string = '';
  //varible de mostrar desctivados
  toggleActDesc: boolean = false;


  //datos a llenar mediante la consulta
  usuarios: Usuario[] = [];
  rol: Rol[] = [];

  //usuarios de prueba para el data source
  /*usuarios: Usuario[] =
   [
     new Usuario(0,'4545454',87788787,'Andres','carvajal','false',new Date,new Date,''),
     new Usuario(0,'14545454',187788787,'Luis','carvajal','false',new Date,new Date,''),
     new Usuario(0,'24545454',987788787,'Carlos','carvajal','false',new Date,new Date,''),
     new Usuario(0,'84545454',787788787,'Juan','carvajal','false',new Date,new Date,''),
     new Usuario(0,'64545454',287788787,'lopez','carvajal','false',new Date,new Date,''),
  ]

  ;*/




  //Variables de paginacion y ordenamiento
//  dataSource: MatTableDataSource;
  dataSource: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  //msg de error
  msg: string = '';

  //respuesta del servidor
  public respuesta;

  //PAra alternar entre formularios
  @Output() llamarFormulario = new EventEmitter();
  //envia el usuario al componente de editar
  @Output() enviarUSuario = new EventEmitter();

  //para recibir el mensaje del usuario agregado
  @Input() mensaje: string;


  //para llamar el formulario de Roles;
  @Output() llamarFormRoles = new EventEmitter();

  //clase dinamica pra carga de mensajes
  claseDinamic = "alert alert-success alert-with-icon";
  iconAlert = "done";

  //boton desactivado en caso q no hayan usuarios o este caragndo
  botonBloqueo: boolean = true;



  constructor(private _genericService: GenericServices, public dialog: MatDialog, private injector: Injector, private _exceptionService: ExcepcionService,private router: Router) {


  }


  closeDialog() {
    this.mensaje = '';

  }


  //Metodo que consulta los usuarios y los envia a la tabla



  consultarUsuarios() {
    try {
      //throw new Error('Im errorn');
      this.respuesta = null;

      this._genericService.consultarUsuarios().subscribe(
        response => {
          this.respuesta = response;
          if (this.respuesta.length <= 1) {
            this.mensaje = 'Error en el servidor';
            console.log('Error en el servidor');
            this.mostrarMensaje(0);
          } else {
            //cabeceras
            //this.cabecerasColumnas = this.respuesta.cabeceras;
            //this.cabecerasColumnas.push('actions');
            //conversion del json de usuarios a la clase Usuarios
            //guardamos el objeto en la variable




            //asignacion de los datos en el datasource para la tabla
            console.log("cabeceras:"+this.respuesta.cabeceras);
            console.log(this.respuesta);
            for(let i=0;i<this.respuesta.cabeceras.length;i++)
            {
/*
              this.respuesta.cabeceras[i].nombrecampo
              this.respuesta.cabeceras[i].pkidusuario
              this.respuesta.cabeceras[i].update
              this.respuesta.cabeceras[i].create
              this.respuesta.cabeceras[i].show
              this.respuesta.cabeceras[i].fk
              this.respuesta.cabeceras[i].fktable
              this.respuesta.cabeceras[i].number*/
              if(this.respuesta.cabeceras[i].show==true){
              this.cabecerasColumnas[i]=this.respuesta.cabeceras[i].nombrecampo;
              this.etiquetasColumnas.push({etiqueta:this.respuesta.cabeceras[i].nombreetiqueta,item:this.respuesta.cabeceras[i].nombrecampo});
              }
            }
            this.etiquetasColumnas.push({etiqueta:'Acciones',item:'actions'});
            this.cabecerasColumnas.push('actions');

              console.log(this.cabecerasColumnas);
              console.log(this.etiquetasColumnas);

            //meustra nombres de cabeceras
            //console.log(Object.keys(this.respuesta.cabeceras));
            //console.log(Object.values(this.respuesta.cabeceras));
            console.log("Terce puecsto");


            let cadena = this.router.url.substring(15);;
            let nuevaCadena = cadena.replace('/','');
            console.log(this.respuesta[nuevaCadena]);
            this.router.url
            let valoresgen=Object["keys"](this.respuesta[nuevaCadena]);
            let llavesgen=Object["values"](this.respuesta[nuevaCadena]);


            //let arraygen[];







            //console.log(arraygen);



console.log("pripiedades");


/*let level =  0;
for(var property in this.respuesta.users) {
    console.log('  '.repeat(level) + property);
    if(typeof this.respuesta.users["property"] === 'object') {
        listProps(this.respuesta.users["property"], ++level);
    }
}*/




console.log("cabeceras2:")
            console.log(this.cabecerasColumnas);
              console.log(this.etiquetasColumnas);
                console.log(llavesgen);
          //  console.log(this.respuesta.users[0].nombrerol);

          /*  for (let i = 0; i < this.usuarios.length; i++) {
              console.log(this.respuesta.users[i].roles);
              this.usuarios[i].setRoles(this.respuesta.users[i].roles);


            }*/
            this.dataSource = new MatTableDataSource(llavesgen);
            //console.log("rol: "+this.usuarios[0].getRoles().pkidrol);
            //Aplicamos el filtro de paginado, ordenamiento y filtros
            this.botonBloqueo = false;
            this.aplicarFiltro();


          }

        },
        error => {
          this.mensaje = 'Error en el servidor';
          this.respuesta = 'error';
          this.mostrarMensaje(0);
          console.log('Error en el servidor');
        }
      );
    } catch (e) {
      const mensaje = e.message ? e.message : e.toString();
      let funcion = "constultarUsuario()"
      const location = this.injector.get(LocationStrategy);
      const url = location instanceof PathLocationStrategy
      ? location.path() : '';
      this.enviarExcepcion(mensaje, e, funcion,url);
      //console.log("error asdasd a:" + e.stack);

    }
  }




  ngAfterViewInit() {
    this.consultarUsuarios();
  }


  ngOnInit() {
  }

  //Método para aplicar el filtro en la tabla
  aplicarFiltro() {

    this.dataSource.filter = this.filtroNombreCedula.trim().toLowerCase();


  }


  clearInput() {
    this.filtroNombreCedula = '';
    this.aplicarFiltro();
  }



  //LLama al dialogo de confirmacion para eliminar o no el usuario,
  //le enviamos el parametro del nombre de usuario y el id
  llamarDialog(user:Usuario) {
    try {

      console.log(user.getNombreUsuario());
      this.openDialog(user.getNombreUsuario(), user.getPkidusuario());
    } catch (e) {
      const mensaje = e.message ? e.message : e.toString();
      let funcion = "llamarDialog()"

      const location = this.injector.get(LocationStrategy);
      const url = location instanceof PathLocationStrategy
      ? location.path() : '';
      this.enviarExcepcion(mensaje, e, funcion,url);
      //console.log("error asdasd a:" + e.stack);

    }

  }



  //dialogo de confirmacion para eliminar o no el usuario
  openDialog(nombreUser, idUser): void {
    try {

      const dialogRef = this.dialog.open(DialogConfirmacionGenericComponent, {
        width: '250px',
        data: { nombreUser: nombreUser, idUser: idUser }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
        this.mensaje =  result.respuesta +" Nombre del usuario: "+nombreUser;
        if (result != null) {
          console.log(result.status);
          if (result.status == "error") {
            this.mostrarMensaje(0);
          } else if (result.status == "Success") {
            this.mostrarMensaje(1)
            this.toggleActDesc = false;
            this.consultarUsuarios();

          }
        }
      });
    } catch (e) {
      const mensaje = e.message ? e.message : e.toString();
      let funcion = "openDialog()"

      const location = this.injector.get(LocationStrategy);
      const url = location instanceof PathLocationStrategy
      ? location.path() : '';
      this.enviarExcepcion(mensaje, e, funcion,url);
      //console.log("error asdasd a:" + e.stack);

    }
  }


  cambiarEstado(usuario: Usuario) {
    try {
      let active = usuario.getUsuarioActivo();
      console.log("Active: " + active);

      this._genericService.cambiarEstadoUsuario(usuario.getPkidusuario(), !active, "tusuario").subscribe(
        response => {
          this.respuesta = response;
          if (this.respuesta.length <= 1) {
            this.mensaje = 'Error en el servidor';
            console.log('Error en el servidor');
            this.mostrarMensaje(0);
          } else {
            this.mensaje = "El cambio de estado del usuario " + usuario.getNombreUsuario() + " : " + this.respuesta.msg;
            //cambiamos el usuario de estado
            this.toggleActDesc = false;
            this.consultarUsuarios();

            this.mostrarMensaje(1);
          }
        },
        error => {
          this.mensaje = 'Error en el servidor';
          console.log('Error en el servidor');
          this.mostrarMensaje(0);
        }
      );

    } catch (e) {
      const mensaje = e.message ? e.message : e.toString();
      let funcion = "CambiarEstado()"

      const location = this.injector.get(LocationStrategy);
      const url = location instanceof PathLocationStrategy
      ? location.path() : '';
      this.enviarExcepcion(mensaje, e, funcion,url);
      //console.log("error asdasd a:" + e.stack);

    }

  }

  /*
    MEtodo que asigna de manera dinamica el estilo de agregado y alerta
  */
  mostrarMensaje(codeError: number) {
    if (codeError == 1) {
      this.claseDinamic = "alert alert-success alert-with-icon";
      this.iconAlert = "done";
    } else if (codeError == 0) {
      this.claseDinamic = "alert alert-warning alert-with-icon";
      this.iconAlert = "warning";
    }
  }

  /*
    MEtoido que captura las excepciones y las envia al servicio de capturar la excepcion
  */
  enviarExcepcion(mensaje, e, funcion,url) {
    this._exceptionService.capturarExcepcion({ mensaje, url: url, stack: e.stack, funcion: funcion }).subscribe(
      response => {

        if (response.length <= 1) {
          console.log('Error en el servidor al enviar excepcion');
        } else {
          if(response.status=!"error"){
            console.log('La excepcion se envio correctamente');
          }
        }
      },
      error => {
        console.log('Error en el servidor al enviar excepcion');
      }

    );
  }


}

//interfaz para comunicarse con el dialogo
export interface DialogData {
  nombreUser: string;
  idUser: number;
  respuesta: string;
}
