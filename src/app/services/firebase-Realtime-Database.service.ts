import { Injectable } from '@angular/core';
import { Database, ref, set, push,get,onValue,update,remove} from '@angular/fire/database'; 
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseRealTimeDatabaseService {
  constructor(private db: Database) {}

  listado(carpeta:string): Observable<any[]> {
    const referencia = ref(this.db, `${carpeta}`);
    return new Observable((observer) => {
      onValue(referencia, (snapshot) => {
        const productos: any[] = [];
        snapshot.forEach((childSnapshot) => {
          const producto = { id: childSnapshot.key, ...childSnapshot.val() };
          productos.push(producto);
        });
        observer.next(productos);
      });
    });
  }

  insertar(carpeta: string, datos: Record<string, any>) {
    const referencia = push(ref(this.db, carpeta)); 
    return set(referencia, datos);
  }
  editar(carpeta: string, datos: Record<string, any>) {
    const id = datos['id']; 
    const referencia = ref(this.db, `${carpeta}/${id}`);
    const datosSinId = { ...datos };
    delete datosSinId['id']; 
    return update(referencia, datosSinId); 
  }
  
  obtenerPorId(id: string, carpeta:string): Observable<any> {
    const referencia = ref(this.db, `${carpeta}/${id}`);
    return new Observable((observer) => {
      onValue(referencia, (snapshot) => {
        observer.next(snapshot.val());
      });
    });
  }
   eliminar(id: string, carpeta: string) {
    const referencia = ref(this.db, `${carpeta}/${id}`);
    return remove(referencia);
  }
  verificarCodigoExistente(carpeta: string, codigo: string): Observable<boolean> {
    const referencia = ref(this.db, `${carpeta}`);
    return new Observable((observer) => {
      onValue(referencia, (snapshot) => {
        let codigoExistente = false;
  
        snapshot.forEach((childSnapshot) => {
          const producto = childSnapshot.val();
          if (producto.codigo === codigo) {
            codigoExistente = true;
            return true; 
          }
          return false; 
        });
  
        observer.next(codigoExistente); 
        observer.complete();
      });
    });
  }
  
  contarRegistros(carpeta: string): Observable<number> {
    const referencia = ref(this.db, carpeta);
    return new Observable((observer) => {
      onValue(referencia, (snapshot) => {
        const count = snapshot.size; // Obtiene el número de registros
        observer.next(count);
      });
    });
  }
  
}
