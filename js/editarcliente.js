(function () {
    let DB;
    let idCliente;
    const nombreInput = document.querySelector('#nombre');
    const emailInput = document.querySelector('#email');
    const telefonoInput = document.querySelector('#telefono');
    const empresaInput = document.querySelector('#empresa');

    const formulario = document.querySelector('#formulario');

    document.addEventListener('DOMContentLoaded', () => {

    /* Actualiza el registro */
        formulario.addEventListener('submit', actualizarCliente);

        conectarDB();
    /* Verificar el id de la url, URLSearchParams sirve para extraer la informacion de la url despues de ? y abajo ponemos .get(datos a extraer) para extraer el indicado*/
        const parametrosURL = new URLSearchParams(window.location.search);
        
        idCliente = parametrosURL.get('id');
        if (idCliente) {
            setTimeout(() => {
                obtenerCliente(idCliente);
            }, 100);
        }
    });

    function actualizarCliente(e) {
        e.preventDefault();

        if (nombreInput.value === '' || emailInput.value === '' || empresa.value === '' || telefonoInput.value === '') {
            console.log('Hay campos vacios');
            return;
        }

    /* Actualizar clliente */
        const clienteActualizado = {
            nombre: nombreInput.value,
            email: emailInput.value,
            empresa: empresaInput.value,
            telefono: telefonoInput.value,
            /* En este programa para editar estamos editando un registro y ubicandolo mediante su id, en ese caso al actualizarlo debemos de pasarselo tal y como lo consultamos en este caso al consultarlo era un numero, entonces al actualizarlo tambien debemos de pasarselo en el mismo formato */
            id: Number(idCliente),
        }

        /* Al editar el permiso si debe ser readwrite */
        const transaction = DB.transaction(['crm'], 'readwrite');
        const objectStore = transaction.objectStore('crm');

        /* Esto lo que hara es encontrar nuestro id y con eso actualizar el usuario elegido */
        objectStore.put(clienteActualizado);

        transaction.oncomplete = function () {
            imprimirAlerta('editado correctamente');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
        /* Este error es en caso de que un campo que es unico se repita por ejemplo un correo que es unico */
        transaction.onerror = function () {
            imprimirAlerta('Existen campos vacios o el correo ingresado ya existe ', 'error');
        }
    }

    function obtenerCliente(id) {
        /* el metodo puede ser readwrite o readonly, es exactamente lo mismo */
        const transaction = DB.transaction(['crm'], 'readwrite');
        const objectStore = transaction.objectStore('crm');
        
        const cliente = objectStore.openCursor();

        cliente.onsuccess = function (e) {
            const cursor = e.target.result;
            if (cursor) {
                if (cursor.value.id === Number(id)) {
                    llenarFormulario(cursor.value);
                }
                cursor.continue();
            }
        }
    }

    function llenarFormulario(datosCliente) {
        const { nombre, email, empresa, telefono } = datosCliente;

        nombreInput.value = nombre;
        emailInput.value = email;
        telefonoInput.value = telefono;
        empresaInput.value = empresa;
    }

    function conectarDB() {
        const abrirConexion = window.indexedDB.open('crm', 1);
        abrirConexion.onerror = function () {
            console.log('hubo un error');
        }

        abrirConexion.onsuccess = function () {
            DB = abrirConexion.result;

        }
    }
})();