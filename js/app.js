(function () {
    const listaClientes = document.querySelector('#listado-clientes');
    let DB;

    document.addEventListener('DOMContentLoaded', () => {
        crearDB();

        listaClientes.addEventListener('click', eliminarRegistro);
    })

/* Elimina un cliente */
    function eliminarRegistro(e) {
        if (e.target.classList.contains('eliminar')) {
            const idEliminar = Number(e.target.dataset.cliente);

            const confirmar = window.confirm('Deseas eliminar este cliente?');

            if (confirmar) {
                const transaction = DB.transaction(['crm'], 'readwrite');
                const objectStore = transaction.objectStore('crm');
                objectStore.delete(idEliminar);

                transaction.oncomplete = function () {
                    console.log('eliminado');
                    e.target.parentElement.parentElement.remove();
                }
                transaction.onerror = function () {
                    console.log('hubo un error');
                }
            }
        }
    }

    /* Crea la base de datos de indexDB */
    function crearDB() {
        const crearDB = window.indexedDB.open('crm', 1);

        crearDB.onerror = function () {
            console.log('hubo un error');
        }
        crearDB.onsuccess = function () {
            DB = crearDB.result; 
            mostrarClientes();
        }

        crearDB.onupgradeneeded = function (e) {
            const db = e.target.result;
            const objectStore = db.createObjectStore('crm', { keyPath: 'id', autoIncrement: true });

            objectStore.createIndex('nombre', 'nombre', { unique: false });
            objectStore.createIndex('email', 'email', { unique: true });
            objectStore.createIndex('telefono', 'telefono', { unique: false });
            objectStore.createIndex('empresa', 'empresa', { unique: false });
            objectStore.createIndex('id', 'id', { unique: true });

        }
    }

    function mostrarClientes() {
        while (listaClientes.firstChild) {
            listaClientes.removeChild(listaClientes.firstChild);
        }

        let objectStore = DB.transaction('crm').objectStore('crm');

        objectStore.openCursor().onsuccess = function (e) {
            let cursor = e.target.result;

            if (cursor) {

                const { nombre, telefono, empresa, email, id } = cursor.value;

                let clienteHMTL = document.createElement('tr');
                clienteHMTL.innerHTML += ` 
                    <tr>
                        <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                            <p class="text-sm leading-5 font-medium text-gray-700 text-lg  font-bold"> ${nombre} </p>
                            <p class="text-sm leading-10 text-gray-700"> ${email} </p>
                        </td>
                        <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200 ">
                            <p class="text-gray-700">${telefono}</p>
                        </td>
                        <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200  leading-5 text-gray-700">    
                            <p class="text-gray-600">${empresa}</p>
                        </td>
                        <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-sm leading-5">
                            <a href="editar-cliente.html?id=${id /* Esto de aqui funciona para que al mandarte a la pagina especificada le estas tambien mandando esa informacion a la pagina a entrar */}" class="text-teal-600 hover:text-teal-900 mr-5">Editar</a>
                            <a href="#" data-cliente="${id }" class="text-red-600 hover:text-red-900 eliminar">Eliminar</a>
                        </td>
                    </tr>
                `;
                listaClientes.appendChild(clienteHMTL);

                cursor.continue();
            }
        }
    }
})();