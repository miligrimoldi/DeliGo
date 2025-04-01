const lista = document.getElementById('usuarios-lista');
const form = document.getElementById('formulario-usuario');
const cancelarBtn = document.getElementById('btn-cancelar');
const idInput = document.getElementById('id_usuario');

function cargarUsuarios() {
  fetch('/usuarios')
    .then(res => res.json())
    .then(usuarios => {
      lista.innerHTML = '';
      usuarios.forEach(user => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
          <span>${user.nombre} ${user.apellido} - ${user.email}</span>
          <div>
            <button class="btn btn-sm btn-warning me-2" onclick="editarUsuario(${user.id})">Editar</button>
            <button class="btn btn-sm btn-danger" onclick="borrarUsuario(${user.id})">Borrar</button>
          </div>
        `;
        lista.appendChild(li);
      });
    });
}

cargarUsuarios();

form.addEventListener('submit', e => {
  e.preventDefault();

  const data = {
    nombre: form.nombre.value,
    apellido: form.apellido.value,
    email: form.email.value,
    contrasena: form.contrasena.value
  };

  const id = idInput.value;

  const metodo = id ? 'PUT' : 'POST';
  const url = id ? `/usuarios/${id}` : '/usuarios';

  fetch(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(() => {
      form.reset();
      idInput.value = '';
      cancelarBtn.classList.add('d-none');
      cargarUsuarios();
    });
});

function editarUsuario(id) {
  fetch(`/usuarios/${id}`)
    .then(res => res.json())
    .then(user => {
      form.nombre.value = user.nombre;
      form.apellido.value = user.apellido;
      form.email.value = user.email;
      idInput.value = user.id;
      cancelarBtn.classList.remove('d-none');
    });
}

function borrarUsuario(id) {
  if (confirm('¿Estás seguro de que querés borrar este usuario?')) {
    fetch(`/usuarios/${id}`, {
      method: 'DELETE'
    })
      .then(res => res.json())
      .then(() => cargarUsuarios());
  }
}

cancelarBtn.addEventListener('click', () => {
  form.reset();
  idInput.value = '';
  cancelarBtn.classList.add('d-none');
});
