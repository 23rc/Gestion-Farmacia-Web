import Swal from 'sweetalert2';
import { Router } from '@angular/router';  // Importa el Router


export function alertResultado(accion: 'crear' | 'editar',nombreMedicamento: string,onConfirm: () => Promise<void>,rutaRedireccion: string
) {
  onConfirm()
    .then(() => {
      Swal.fire({
        title: '¡Éxito!',
        text: `El producto "${nombreMedicamento}" ha sido ${accion === 'crear' ? 'creado' : 'editado'} correctamente.`,
        icon: 'success',
        confirmButtonColor: '#3085d6',
      }).then(() => {
        window.location.href = rutaRedireccion;
      });
    })
    .catch(() => {
      Swal.fire({
        title: 'Error',
        text: 'Hubo un problema al guardar los datos. Intenta nuevamente.',
        icon: 'error',
        confirmButtonColor: '#d33',
      });
    });
}
export function alertCodigoExistente() {
  Swal.fire({
    title: '¡Advertencia!',
    text: 'El código de producto ya existe. Si deseas agregar más cantidad, edita el producto.',
    icon: 'warning',
    confirmButtonColor: '#3085d6',
  });
}

export function alertExito(titulo: string, mensaje: string, router: Router, url: string) {
  router.navigate([url]).then(() => {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: titulo,
      text: mensaje,
      showConfirmButton: false, 
      timer: 700, // 
      timerProgressBar: true,
      background: '#ffffff', 
      confirmButtonColor: '#3085d6',
    });
  });
}

// ✅ NUEVA FUNCIÓN: MUESTRA ÉXITO SIN REDIRIGIR NI CERRAR MODAL
export function alertExitoSinRedirigir(titulo: string, mensaje: string) {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: titulo,
    text: mensaje,
    showConfirmButton: false, 
    timer: 700,
    timerProgressBar: true,
    background: '#ffffff', 
    confirmButtonColor: '#3085d6',
  });
}


export function alertError(mensaje: string) {
  Swal.fire({
    toast: true,
    position: 'top-end', 
    icon: 'error',
    title: '¡Error!',
    text: mensaje,
    showConfirmButton: false, // Oculta el botón de confirmación
    timer: 3000, 
    timerProgressBar: true, // Muestra una barra de progreso
    background: '#ffffff', // Fondo blanco
    confirmButtonColor: '#d33',
  });
}
export function alertEliminar(onConfirm: () => Promise<void>, nombreMedicamento: string, rutaRedireccion: string) {
  Swal.fire({
    title: `¿Estás seguro de eliminar el registro "${nombreMedicamento}"?`,
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm()
        .then(() => {
          Swal.fire(
            'Eliminado!',
            `El registro "${nombreMedicamento}" ha sido eliminado correctamente.`,
            'success'
          ).then(() => {
            window.location.href = rutaRedireccion;
          });
        })
        .catch(() => {
          Swal.fire(
            'Error!',
            'Hubo un problema al eliminar el registro. Intenta nuevamente.',
            'error'
          );
        });
    } else {
      Swal.fire(
        'Cancelado',
        'El registro no ha sido eliminado.',
        'info'
      );
    }
  });
}
// ✅ NUEVA: ELIMINA SIN REDIRIGIR A NINGÚN LADO (PARA MODALES)
export function alertEliminarSinRedirigir(onConfirm: () => Promise<void>, nombreMedicamento: string) {
  Swal.fire({
    title: `¿Estás seguro de eliminar el registro "${nombreMedicamento}"?`,
    text: 'Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm()
        .then(() => {
          Swal.fire(
            'Eliminado!',
            `El registro "${nombreMedicamento}" ha sido eliminado correctamente.`,
            'success'
          ); // ✅ SIN REDIRECCIÓN
        })
        .catch(() => {
          Swal.fire(
            'Error!',
            'Hubo un problema al eliminar el registro. Intenta nuevamente.',
            'error'
          );
        });
    } else {
      Swal.fire(
        'Cancelado',
        'El registro no ha sido eliminado.',
        'info'
      );
    }
  });
}


export function alertPeticion(onConfirm: () => void) {
  const appRoot = document.querySelector('app-root'); 
  if (appRoot) {
    appRoot.setAttribute('inert', 'true');
  }
  Swal.fire({
    title: 'Ingrese el código',
    input: 'password', 
    inputAttributes: {
      autocapitalize: 'off',
    },
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar',
    preConfirm: (codigoIngresado) => {
      if (codigoIngresado === 'roberto') {
        return true; 
      } else {
        Swal.showValidationMessage('Código incorrecto');
        return false;
      }
    },
    allowOutsideClick: () => !Swal.isLoading(), 
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        icon: 'success',
        title: 'Acceso concedido',
        text: 'Todo fue exitoso.',
        confirmButtonText: 'Aceptar',
      }).then(() => {
        onConfirm(); 
      });
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      console.log('Operación cancelada');
    }
  }).catch(() => {
    Swal.fire({
      icon: 'error',
      title: 'Acceso denegado',
      text: 'El código ingresado es incorrecto.',
      confirmButtonText: 'Aceptar',
    });
  }).finally(() => {

    if (appRoot) {
      appRoot.removeAttribute('inert');
    }
  });
}
