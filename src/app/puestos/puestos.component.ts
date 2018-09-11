import { Component, OnInit, ViewChild, Injector } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { plainToClass } from "class-transformer";
import { ExcepcionService } from '../servicios/excepcionServices.services';
import { PathLocationStrategy, LocationStrategy } from '@angular/common';
import { DialogConfirmacionTipos } from '../tipos/dialogTipo.confirm.component';
import { TipoPuesto } from '../modelos/tipos/tipopuesto';
import { SectorInterface } from '../sectores/sectores.component';
import { PuestosServices } from '../servicios/puestoServices.service';
import { Puesto } from '../modelos/puesto';
import { PlazaMercado } from '../modelos/plaza-mercado';
import { PlazaServices } from '../servicios/plazaServices.services';
import { SectoresServices } from '../servicios/sectorServices.service';
import { Zona } from '../modelos/zona';
import { ZonasServices } from '../servicios/zonaServices.services';
@Component({
  selector: 'app-puestos',
  templateUrl: './puestos.component.html',
  styleUrls: ['./puestos.component.scss'],
  providers: [PuestosServices, ExcepcionService, PlazaServices, SectoresServices,ZonasServices]
})
export class PuestosComponent implements OnInit {

  cabecerasColumnas = ['nombreplaza', 'nombrezona', 'nombresector', 'nombretipopuesto', 'numeropuesto', 'actions'];
  //variable de entrada de texto del imput buscar(nombre sector )
  filtroNombrePuesto: string = '';
  //varible de mostrar desctivados
  toggleActDesc: boolean = false;

  puesto: Puesto[];
  //variable puesto interface
  puestointer: PuestoInterface[] = [];



  //Variables de paginacion y ordenamiento
  dataSource: MatTableDataSource<PuestoInterface>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  //respuesta del servidor
  public respuesta;

  //clase dinamica pra carga de mensajes
  claseDinamic = "alert alert-warning alert-with-icon";
  iconAlert = "warning";

  //mensaje de respuesta
  public mensaje: string;

  //variable para retornar los tipos de puesto y lo sectores para el select
  tipopuesto: TipoPuesto[];
  sectores: SectorInterface[] = [];
  //variable para retornar las plazas de mercado
  plazasmercado: PlazaMercado[] = [];

  //boton desactivado en caso q no hayan roles o este caragndo
  botonBloqueo: boolean = true;

  //variable asignada al selector de busqeuda por plaza
  plazaselect: string = '';
  sectorselect: string = '';

  //variable para saber si hay datos con el select escogido
  haydatos: boolean = true;


  /*-------------------------------------------------------------------------- */
  //Variables para el formulario de agregar un nuevo puesto
  mostrarFormPuesto = false;
  mostrarTabla = true;

  //formulario reactive
  nuevoPuestoForm: FormGroup;
  //actvar puestos, desactivar puestos
  active = false;
  textActive = "Desactivado";
  //mensaje del boton actulizar guardar
  mensajeBoton: string;
  puesto2: PuestoInterface;

  //mensaje para mostrar en el formulario de agregar
  msg: string = '';
  //progreso de envio
  creandopuesto: boolean = false;
  //variable que valida si esta por actualizar o guardar un nuevo
  isUpdate = false;

  constructor(private _zonasServices:ZonasServices,private nuevoForm: FormBuilder,public dialog: MatDialog,private _puestoService: PuestosServices, private _exceptionService: ExcepcionService, private _plazasServices: PlazaServices,private _sectorService: SectoresServices, private injector: Injector) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.consultarPuestos();
    this.consultarPlazasMercado();
    this.consultarSectores();

  }
  consultarPuestos() {

    this.puestointer = [];
    try {
      this.respuesta = null;
      this._puestoService.consultarTodosPuestos().subscribe(
        response => {
          this.respuesta = response;
          if (this.respuesta.length <= 1) {
            this.mensaje = 'Error en el servidor';
            console.log('Error en el servidor');
            this.mostrarMensaje(0);
          } else {


            this.puesto = plainToClass(Puesto, this.respuesta.puesto);
            //setear en una interfaz para el correcto ordenamiento en la tabla
            //puesto que daba problemas al acceder desde el objeto puesto a las propiedades de los sub objetos
            //contenidos en el y no ordenaba
            console.log(this.puesto[0].getSector()['zona']['plaza'].nombreplaza);
            this.puesto.map((z) => {
              let pi: PuestoInterface = {
                pkidpuesto: null, codigopuesto: '', nombrezona: '', nombreplaza: '', numeropuesto: '', puestoactivo: false, fkidactividad: null, fkidestado: null, fkidtipopuesto: null, nombresector: '', alto: null, ancho: null, fkidsector: null, nombretipopuesto: '',pkidplaza:null,pkizona:null
              };
              pi.pkidpuesto = z.getPkidpuesto();
              pi.codigopuesto = z.getCodigopuesto();
              pi.numeropuesto = z.getNumeropuesto();
              pi.nombrezona = z.getSector()['zona'].nombrezona;
              pi.pkizona = z.getSector()['zona'].pkidzona;
              pi.nombreplaza = z.getSector()['zona']['plaza'].nombreplaza;
              pi.pkidplaza= z.getSector()['zona']['plaza'].pkidplaza;
              pi.nombresector = z.getSector().nombresector;
              pi.nombretipopuesto = z.getTipopuesto().nombretipopuesto;
              pi.puestoactivo = z.getPuestoactivo();
              pi.fkidactividad = z.getActividadcomercial().pkidactividad;
              pi.fkidestado = z.getEstadoinfraestructura().pkidestado;
              pi.fkidsector = z.getSector().pkidsector;
              pi.fkidtipopuesto = z.getTipopuesto().pkidtipopuesto;


              this.puestointer.push(pi)
            }
            );
            //seteamos el valor de los puestoe en el objeto puesto

            this.dataSource = new MatTableDataSource<any>(this.puestointer);

            this.botonBloqueo = false;
            this.aplicarFiltro();
            this.setFilterDataTable();
          }
        },
        error => {
          this.mensaje = 'Error en el servidor';
          this.respuesta = 'error';
          this.mostrarMensaje(0);
          console.log('Error en el servidor: ' + error);
        }

      );
    } catch (e) {
      const mensaje = e.message ? e.message : e.toString();
      let funcion = "consultarPuestos()"
      const location = this.injector.get(LocationStrategy);
      const url = location instanceof PathLocationStrategy
        ? location.path() : '';
      this.enviarExcepcion(mensaje, e, funcion, url);

    }

  }

  consultarPlazasMercado() {
    try {
      this.respuesta = null;

      this._plazasServices.consultarTodasPlazas().subscribe(
        response => {
          this.respuesta = response;
          if (this.respuesta.length <= 1) {
            this.mensaje = 'Error en el servidor';
            console.log('Error en el servidor');
            this.mostrarMensaje(0);
          } else {
            //conversion del json de plazas a la clase plazas 
            //guardamos el objeto en la variable
            this.plazasmercado = plainToClass(PlazaMercado, this.respuesta.plazas);
          }

        },
        error => {
          this.mensaje = 'Error en el servidor';
          this.respuesta = 'error al consultar las plazas de mercado';
          this.mostrarMensaje(0);
          console.log('Error en el servidor');
        }

      );
    } catch (e) {
      const mensaje = e.message ? e.message : e.toString();
      let funcion = "consultarPlazasMercado()"

      const location = this.injector.get(LocationStrategy);
      const url = location instanceof PathLocationStrategy
        ? location.path() : '';
      this.enviarExcepcion(mensaje, e, funcion, url);

    }
  }

  //metodo para cobnsltar todos los sectores y setearlos en el select de sectores
  consultarSectores() {
    try {
      this.respuesta = null;

      this._sectorService.consultarTodosSectores().subscribe(
        response => {
          this.respuesta = response;
          if (this.respuesta.length <= 1) {
            this.mensaje = 'Error en el servidor';
            console.log('Error en el servidor');
            this.mostrarMensaje(0);
          } else {
            //conversion del json de plazas a la clase plazas 
            //guardamos el objeto en la variable
            this.sectores =  this.respuesta.sector;
          }

        },
        error => {
          this.mensaje = 'Error en el servidor';
          this.respuesta = 'error al consultar las plazas de mercado';
          this.mostrarMensaje(0);
          console.log('Error en el servidor');
        }

      );
    } catch (e) {
      const mensaje = e.message ? e.message : e.toString();
      let funcion = "consultarPlazasMercado()"

      const location = this.injector.get(LocationStrategy);
      const url = location instanceof PathLocationStrategy
        ? location.path() : '';
      this.enviarExcepcion(mensaje, e, funcion, url);

    }
  }


  clearInput() {
    this.filtroNombrePuesto = '';
    this.aplicarFiltro();
  }


  setFilterDataTable() {
   
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate = (data: PuestoInterface, filter: string) => {
        //console.log(filter);
        //console.log(this.sectorselect );
        //console.log(data.nombresector);
        //console.log(data.nombresector.indexOf(this.sectorselect) !== -1);
        
        this.haydatos = ((data.numeropuesto.toLowerCase().indexOf(this.filtroNombrePuesto) !== -1) && (data.puestoactivo == true || this.toggleActDesc == true) && (data.nombresector.indexOf(this.sectorselect) !== -1) && (data.nombreplaza.indexOf(this.plazaselect) !== -1));
        console.log(this.haydatos);
        return (this.haydatos);
      };


  }

  closeDialog() {
    this.mensaje = '';
  }


  /**
   * 
   * Metodo que cambia el estado de el puesto de la base de datos
   */
  cambiarEstadoPuesto(puestos){
    let puesto: Puesto = new Puesto();
    puesto.setPkidpuesto(puestos.pkidpuesto);
    puesto.setNumeropuesto(puestos.numeropuesto);
    try {
      let active = puestos.puestoactivo;
      console.log("Active: " + active);

      this._puestoService.cambiarEstadoPuesto(puesto.getPkidpuesto(), !active, "tpuesto").subscribe(
        response => {
          this.respuesta = response;
          if (this.respuesta.length <= 1) {
            this.mensaje = 'Error en el servidor';
            console.log('Error en el servidor');
            this.mostrarMensaje(0);
          } else {
            this.mensaje = "El cambio de estado del puesto " + puesto.getNumeropuesto() + " : " + this.respuesta.msg;
            //cambiamos eal rol de estado
            this.toggleActDesc = false;
            this.consultarPuestos();
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
      let funcion = "cambiarEstadoZona()"

      const location = this.injector.get(LocationStrategy);
      const url = location instanceof PathLocationStrategy
        ? location.path() : '';
      this.enviarExcepcion(mensaje, e, funcion, url);

    }
  }



  
  //dialogo de confirmacion para eliminar o no el usuario
  openDialog(puestos): void {
    try {
      let nombrepuesto = puestos.numeropuesto;
      let idpuesto = puestos.pkidpuesto;

      const dialogRef = this.dialog.open(DialogConfirmacionTipos, {
        width: '250px',
        data: { nombre: nombrepuesto, id: idpuesto, tipoIdentifi: 5 }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
        this.mensaje = result.respuesta + " Nombre Zona : " + nombrepuesto;
        if (result != null) {
          console.log(result.status);
          if (result.status == "error") {
            this.mostrarMensaje(0);
          } else if (result.status == "Exito") {
            this.mostrarMensaje(1)
            this.toggleActDesc = false;
            this.consultarPuestos();
          }
        }
      });
    } catch (e) {
      const mensaje = e.message ? e.message : e.toString();
      let funcion = "openDialog()"

      const location = this.injector.get(LocationStrategy);
      const url = location instanceof PathLocationStrategy
        ? location.path() : '';
      this.enviarExcepcion(mensaje, e, funcion, url);

    }
  }

  aplicarFiltro() {
    //console.log(this.zonaselect);

    this.dataSource.filter = this.filtroNombrePuesto + (!this.toggleActDesc) + this.plazaselect + this.sectorselect;
  }


  /**
  * Metodos para agregar un nuevo zona o editar un zona 
   */

  //llamamos al fomrulario para agregar un nuevo zona y inicializamos las validaciones del formulario
  llamarFormularioAgregarPuesto(element:PuestoInterface) {
    try {
      console.log(element);

      this.mostrarFormPuesto = !this.mostrarFormPuesto;
      this.mostrarTabla = !this.mostrarTabla;
      //si llega por actualizar seteamos el objeto zona 2 con los campos de las variables
        this.puesto2 = element!=null?element:null;
            this.isUpdate = element != null ? true : false;

      //Consultar los usuaros de tipo recaudo y consultar las plazas de mercadp q no tengan ninguna asignacion en zonas

      
      //validamos el formulario solo en caso que este este visible
      if (this.mostrarFormPuesto) {

        if(this.puesto2!=null){
          this.buscarZonaPorPlazaForm(this.puesto2.pkidplaza);
          this.buscarSectorPorZonaForm(this.puesto2.pkizona);
          
        }

        
        this.nuevoPuestoForm = this.nuevoForm.group({
          codigopuesto: [this.puesto2 != null ? this.puesto2.codigopuesto : ''],
          numeropuesto: [this.puesto2 != null ? this.puesto2.numeropuesto : '', Validators.required],
          alto: [this.puesto2 != null ? this.puesto2.alto : ''],
          ancho: [this.puesto2 != null ? this.puesto2.ancho : ''],
          pkidplaza: [this.puesto2 != null ? this.puesto2.pkidplaza : ''],
          pkidzona: [this.puesto2 != null ? this.puesto2.pkizona : ''],
          pkidsector: [this.puesto2 != null ? this.puesto2.fkidsector : '', Validators.required],
        });
      }
      this.active = this.puesto2 != null ? this.puesto2.puestoactivo: false;
      this.textActive = this.active ? "Activado" : "Desactivado";
      //si el zona es nullo, significa que entra por un nuevo objeto
      this.mensajeBoton = this.puesto2 == null ? "Guardar" : "Actualizar";


    } catch (e) {
      const mensaje = e.message ? e.message : e.toString();
      let funcion = "LlamarFormularioAgregarPuesto()"

      const location = this.injector.get(LocationStrategy);
      const url = location instanceof PathLocationStrategy
        ? location.path() : '';
      this.enviarExcepcion(mensaje, e, funcion, url);

    }
  }


  sectoresForm: any[];
  buscarSectorPorZonaForm(event) {
    try {
      //this.nuevoSectorForm.get('pkidzona').setValue('');//cada vez q cambie el selector de plazas, se reinicia el select de zonas
      let pkidzona =event.value!=null? event.value: event;//capturar el value (pkidzona) cuando cambie el select me lleve el zonasForm para el select de zonas
      this.respuesta = null;

      this._sectorService.consultarSectorPorZona(pkidzona,"true").subscribe(
        response => {
          this.respuesta = response;
          if (this.respuesta.length <= 1) {
            this.mensaje = 'Error en el servidor';
            console.log('Error en el servidor');
            this.mostrarMensaje(0);
          } else {
            this.sectoresForm = this.respuesta.sector;
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
    let funcion = "buscarZonaPorPlazaForm()"

    const location = this.injector.get(LocationStrategy);
    const url = location instanceof PathLocationStrategy
      ? location.path() : '';
    this.enviarExcepcion(mensaje, e, funcion, url);

  }


  }


   //variable para setear el selector de zonas en el formulario con respecto al pkid de la plaza
   zonasform: Zona[] ;
   //metodo que busca las zonas y las setea en el select zonas de plazas
   buscarZonaPorPlazaForm(event){
     try {
         //this.nuevoSectorForm.get('pkidzona').setValue('');//cada vez q cambie el selector de plazas, se reinicia el select de zonas
         let pkidplaza =event.value!=null? event.value: event;//capturar el value (pkidplaza) cuando cambie el select me lleve el zonasForm para el select de zonas
         this.respuesta = null;
 
         this._zonasServices.consultarZonasPorPlaza(pkidplaza,"false").subscribe(
           response => {
             this.respuesta = response;
             if (this.respuesta.length <= 1) {
               this.mensaje = 'Error en el servidor';
               console.log('Error en el servidor');
               this.mostrarMensaje(0);
             } else {
               this.zonasform = this.respuesta.zonas;
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
       let funcion = "buscarZonaPorPlazaForm()"
 
       const location = this.injector.get(LocationStrategy);
       const url = location instanceof PathLocationStrategy
         ? location.path() : '';
       this.enviarExcepcion(mensaje, e, funcion, url);
 
     }
     
   }

  //activar o desctivar el boton y mostrar visualmente
  activarDesactivarpuesto() {
    this.active = !this.active;
    this.textActive = this.active ? "Activado" : "Desactivado";
  }


  
  //Mostrar mensaje variable estilizado de error o de confirmacion 
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
  enviarExcepcion(mensaje, e, funcion, url) {
    this._exceptionService.capturarExcepcion({ mensaje, url: url, stack: e.stack, funcion: funcion }).subscribe(
      response => {

        if (response.length <= 1) {
          console.log('Error en el servidor al enviar excepcion');
        } else {
          if (response.status = !"error") {
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


interface PuestoInterface {
  pkidpuesto: number;
  codigopuesto: string;
  numeropuesto: string;
  alto: number;
  ancho: number;
  puestoactivo: boolean;
  fkidsector: number;
  nombresector: string;
  fkidestado: number;
  fkidactividad: number;
  fkidtipopuesto: number;
  nombretipopuesto: string;

  //nombreplaza y nombre zona para el mattable, pueden ser vacias 
  nombreplaza: string;
  pkidplaza: number;
  nombrezona: string;
  pkizona: number;

}
