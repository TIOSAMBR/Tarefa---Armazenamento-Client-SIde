document.addEventListener('DOMContentLoaded', function() {
    const dbVersion = 1;
    const dbName = 'UserDB';
    const storeName = 'users';
    let db;

    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = function(event) {
        console.error("Erro ao abrir o banco de dados: " + event.target.errorCode);
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        showUsers();
    };

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        if (!db.objectStoreNames.contains(storeName)) {
            const objectStore = db.createObjectStore(storeName, { keyPath: 'email' });
            objectStore.createIndex('nome', 'nome', { unique: false });
            objectStore.createIndex('telefone', 'telefone', { unique: false });
            objectStore.createIndex('email', 'email', { unique: true });
        }
    };

    document.getElementById('save-btn').addEventListener('click', function() {
        const name = document.getElementById('nome').value;
        const phone = document.getElementById('telefone').value;
        const email = document.getElementById('email').value;

        if (validateFormulario()) {
            const user = { nome: name, telefone: phone, email: email };
            const transaction = db.transaction([storeName], 'readwrite');
            const objectStore = transaction.objectStore(storeName);

            objectStore.put(user);

            transaction.oncomplete = function() {
                showUsers();
                document.getElementById('user-form').reset();
            };
        } else {
            alert('Preencha os campos corretamente.');
        }
    });

    document.getElementById('user-form').addEventListener('input', function() {
        const name = document.getElementById('nome').value;
        const phone = document.getElementById('telefone').value;
        const email = document.getElementById('email').value;
        const saveBtn = document.getElementById('save-btn');

        if (validateFormulario()) {
            saveBtn.removeAttribute('disabled'); 
        } else {
            saveBtn.setAttribute('disabled', true); 
        }
    });

    function showUsers() {
        const transaction = db.transaction([storeName], 'readonly');
        const objectStore = transaction.objectStore(storeName);
        const userList = document.getElementById('user-list');
        userList.innerHTML = '';

        objectStore.openCursor().onsuccess = function(event) {
            const cursor = event.target.result;
            if (cursor) {
                const userItem = document.createElement('li');
                userItem.textContent = `Nome: ${cursor.value.nome}, Telefone: ${cursor.value.telefone}, E-mail: ${cursor.value.email}`;
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Deletar';
                deleteBtn.addEventListener('click', function() {
                    deleteUser(cursor.value.email);
                });
                userItem.appendChild(deleteBtn);
                userList.appendChild(userItem);
                cursor.continue();
            }
        };
    }

    function deleteUser(email) {
        const transaction = db.transaction([storeName], 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        objectStore.delete(email);

        transaction.oncomplete = function() {
            showUsers();
        };
    }

    function validateFormulario() {
        return (
            validarNome() &&
            validarEmail() &&
            validarTelefone()
        );
    }

    function validarNome() {
        const nomeInput = document.getElementById("nome");
        const nome = nomeInput.value.trim();
        if (nome.length < 2 || nome.length > 30) {
            return false;
        } else {
            return true;
        }
    }

    function validarTelefone() {
        const telefoneInput = document.getElementById("telefone");
        const telefone = telefoneInput.value.trim();
    
        const telefoneRegex = /^(\(\d{2}\)\s?)?9\d{4}[-\s]?\d{4}$/;
    
        if (!telefoneRegex.test(telefone)) {
            return false;
        } else {
            return true;
        }
    }

    function validarEmail() {
        const emailInput = document.getElementById("email");
        const email = emailInput.value.trim();
        const emailRegex = /^[a-zA-Z][a-zA-Z0-9_\-\.]*@[a-zA-Z0-9]+\.[a-zA-Z]{2,4}(\.[a-zA-Z]{2})?$/;
        if (!emailRegex.test(email)) {
            return false;
        } else {
            return true;
        }
    }
});
