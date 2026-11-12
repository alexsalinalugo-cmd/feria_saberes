import { DefinirNav } from "../../components/navbar.js";
import { AdminServices } from "../../services/adminServices.js";
import { getAccessToken } from "../../services/api/api.client.js";

const MostrarNavbar = document.getElementById("navbar-placeholder");

MostrarNavbar.innerHTML = DefinirNav();

const listaUsuarios = document.getElementById("lista-usuarios");
const usuariosStatus = document.getElementById("usuarios-status");
const btnNuevoUsuario = document.getElementById("btn-nuevo-usuario");
const btnCancelarUsuario = document.getElementById("btn-cancelar-usuario");
const formUsuario = document.getElementById("form-usuario");
const usuarioFeedback = document.getElementById("usuario-feedback");
const tituloFormulario = formUsuario.querySelector("h3");
const btnGuardarUsuario = formUsuario.querySelector('button[type="submit"]');

let usuarioEditandoId = null;

const listaDivisiones = document.getElementById("lista-divisiones");
const divisionesStatus = document.getElementById("divisiones-status");
const listaProyectos = document.getElementById("lista-proyectos");
const proyectosStatus = document.getElementById("proyectos-status");
const formProyecto = document.getElementById("form-proyecto");
const btnCancelarProyecto = document.getElementById("btn-cancelar-proyecto");
const proyectoFeedback = document.getElementById("proyecto-feedback");
let proyectoEditandoId = null;
const listaProyectosBaja = document.getElementById("lista-proyectos-baja");
const proyectosBajaStatus = document.getElementById("proyectos-baja-status");
const btnVerBajas = document.getElementById("btn-ver-bajas");
const btnNuevaDivision = document.getElementById("btn-nueva-division");
const btnCancelarDivision = document.getElementById("btn-cancelar-division");
const formDivision = document.getElementById("form-division");
const divisionFeedback = document.getElementById("division-feedback");

async function cargarUsuarios() {
  usuariosStatus.textContent = "Cargando Usuarios...";
  listaUsuarios.innerHTML = "";

  try {
    const usuarios = await AdminServices.getUsuarios();

    if (usuarios.length === 0) {
      usuariosStatus.textContent = "Todavia no hay Usuarios Registrados.";
      return;
    }

    usuariosStatus.textContent = `Se encontraron ${usuarios.length} usuarios.`;

    usuarios.forEach((usuario) => {
      const tarjeta = document.createElement("article");

      tarjeta.classList.add("admin-user-card");

      const informacion = document.createElement("div");

      informacion.classList.add("admin-user-info");

      const nombre = document.createElement("strong");
      nombre.textContent = usuario.nombre;

      const id = document.createElement("span");
      id.textContent = `ID: ${usuario.id}`;

      const rol = document.createElement("span");
      rol.textContent = `rol: ${usuario.rol || "sin Rol asignado"}`;

      const acciones = document.createElement("div");
      acciones.classList.add("admin-user-actions");

      const btnEditar = document.createElement("button");
      btnEditar.textContent = "Editar";
      btnEditar.classList.add("secondary-button");
      btnEditar.type = "button";
      btnEditar.addEventListener("click", () => {
        usuarioEditandoId = usuario.id;

        tituloFormulario.textContent = "Editar Usuario";
        btnGuardarUsuario.textContent = "Guardar Cambios";

        document.getElementById("usuario-nombre").value = usuario.nombre;
        document.getElementById("usuario-rol").value = usuario.rol || "usuario";

        const campoContrasena = document.getElementById("usuario-contrasena");
        campoContrasena.value = "";
        campoContrasena.required = false;
        formUsuario.querySelector(
          'label[for="usuario-contrasena"]',
        ).textContent = "Nueva contraseña (opcional)";
        campoContrasena.placeholder =
          "Dejá vacío para conservar la contraseña actual";

        formUsuario.classList.remove("hidden");
        usuarioFeedback.textContent = "";
      });

      acciones.appendChild(btnEditar);
      informacion.append(nombre, id, rol);
      tarjeta.append(informacion, acciones);
      listaUsuarios.appendChild(tarjeta);
    });
  } catch (error) {
    usuariosStatus.textContent = error.message;
  }
}

async function cargarDivisiones() {
  divisionesStatus.textContent = "Cargando Divisiones...";
  listaDivisiones.innerHTML = "";

  try {
    const divisiones = await AdminServices.getDivisiones();

    if (divisiones.length === 0) {
      divisionesStatus.textContent = "Todavia no hay Divisiones Registradas.";
      return;
    }

    divisionesStatus.textContent = `se encontraron ${divisiones.length} divisiones.`;

    divisiones.forEach((division) => {
      const tarjeta = document.createElement("article");

      tarjeta.classList.add("admin-user-card");

      const informacion = document.createElement("div");

      informacion.classList.add("admin-user-info");

      const nombre = document.createElement("strong");
      nombre.textContent = `${division.anio} ${division.division || ""}`.trim();

      const ciclo = document.createElement("span");
      ciclo.textContent = `Ciclo: ${division.ciclo}`;

      const orientacion = document.createElement("span");
      orientacion.textContent = `Orientacion: ${division.orientacion}`;

      const id = document.createElement("span");
      id.textContent = `ID: ${division.id}`;

      const acciones = document.createElement("div");
      acciones.classList.add("admin-user-actions");

      const btnEditar = document.createElement("button");
      btnEditar.textContent = "Editar";
      btnEditar.classList.add("secondary-button");
      btnEditar.type = "button";

      btnEditar.addEventListener("click", () => {
        formDivision.dataset.id = division.id;
        formDivision.querySelector("h3").textContent = "Editar Division";
        document.querySelector(
          "#form-division button[type='submit']",
        ).textContent = "Guardar Cambios";

        document.getElementById("division-anio").value = division.anio;
        document.getElementById("division-ciclo").value = division.ciclo;
        document.getElementById("division-nombre").value =
          division.division || "";
        document.getElementById("division-orientacion").value =
          division.orientacion;

        divisionFeedback.textContent = "";
        divisionFeedback.className = "";

        formDivision.classList.remove("hidden");
      });

      acciones.appendChild(btnEditar);

      informacion.append(nombre, ciclo, orientacion, id);
      tarjeta.append(informacion, acciones);

      listaDivisiones.appendChild(tarjeta);
    });
  } catch (error) {
    divisionesStatus.textContent = error.message;
  }
}

btnNuevaDivision.addEventListener("click", () => {
  formDivision.reset();
  delete formDivision.dataset.id;

  formDivision.querySelector("h3").textContent = "Registrar Nueva División";

  formDivision.querySelector('button[type="submit"]').textContent =
    "Guardar división";

  divisionFeedback.textContent = "";
  divisionFeedback.className = "";

  formDivision.classList.remove("hidden");
});

btnCancelarDivision.addEventListener("click", () => {
  formDivision.reset();
  delete formDivision.dataset.id;

  formDivision.querySelector("h3").textContent = "Registrar Nueva División";

  formDivision.querySelector('button[type="submit"]').textContent =
    "Guardar división";

  divisionFeedback.textContent = "";
  divisionFeedback.className = "";

  formDivision.classList.add("hidden");
});

formDivision.addEventListener("submit", async (event) => {
  event.preventDefault();

  const division = {
    anio: document.getElementById("division-anio").value,
    ciclo: document.getElementById("division-ciclo").value,
    division:
      document.getElementById("division-nombre").value.trim() || undefined,
    orientacion: document.getElementById("division-orientacion").value || null,
  };

  divisionFeedback.textContent = "Registrando Division...";
  divisionFeedback.className = "";

  try {
    const id = formDivision.dataset.id;

    if (id) {
      await AdminServices.actualizarDivision(id, division);

      divisionFeedback.textContent = "División Actualizada Correctamente.";
    } else {
      await AdminServices.crearDivision(division);

      divisionFeedback.textContent = "División Creada Correctamente.";
    }

    divisionFeedback.className = "is-success";

    formDivision.reset();
    delete formDivision.dataset.id;

    formDivision.querySelector("h3").textContent = "Registrar Nueva División";

    formDivision.querySelector('button[type="submit"]').textContent =
      "Guardar división";

    formDivision.classList.add("hidden");

    await cargarDivisiones();
  } catch (error) {
    divisionFeedback.textContent = error.message;
    divisionFeedback.className = "is-error";
  }
});

btnNuevoUsuario.addEventListener("click", () => {
  usuarioEditandoId = null;

  formUsuario.reset();

  tituloFormulario.textContent = "Registrar Nuevo Usuario";
  btnGuardarUsuario.textContent = "Guardar Usuario";

  const campoContrasena = document.getElementById("usuario-contrasena");
  campoContrasena.required = true;
  formUsuario.querySelector('label[for="usuario-contrasena"]').textContent =
    "Contraseña";
  campoContrasena.placeholder = "Ingrese una Contraseña";

  usuarioFeedback.textContent = "";
  formUsuario.classList.remove("hidden");
});

btnCancelarUsuario.addEventListener("click", () => {
  usuarioEditandoId = null;

  formUsuario.reset();

  tituloFormulario.textContent = "Registrar Nuevo Usuario";
  btnGuardarUsuario.textContent = "Guardar Usuario";

  const campoContrasena = document.getElementById("usuario-contrasena");
  campoContrasena.required = true;
  formUsuario.querySelector('label[for="usuario-contrasena"]').textContent =
    "Contraseña";
  campoContrasena.placeholder = "Ingresa una Contraseña";

  usuarioFeedback.textContent = "";
  formUsuario.classList.add("hidden");
});

formUsuario.addEventListener("submit", async (event) => {
  event.preventDefault();

  const usuario = {
    nombre: document.getElementById("usuario-nombre").value.trim(),
    rol: document.getElementById("usuario-rol").value,
  };

  usuarioFeedback.textContent = usuarioEditandoId
    ? "Cargando Usuario..."
    : "Registrando Usuario...";

  usuarioFeedback.className = "";

  try {
    if (usuarioEditandoId !== null) {
      const nuevaContrasena =
        document.getElementById("usuario-contrasena").value;
      if (nuevaContrasena) {
        usuario.contrasena = nuevaContrasena;
      }

      await AdminServices.actualizarUsuario(usuarioEditandoId, usuario);

      usuarioFeedback.textContent = "Usuario Actualizado Correctamente.";
    } else {
      usuario.contrasena = document.getElementById("usuario-contrasena").value;

      await AdminServices.crearUsuario(usuario);
      usuarioFeedback.textContent = "Usuario creado correctamente.";
    }

    usuarioFeedback.className = "is-success";

    formUsuario.reset();
    usuarioEditandoId = null;

    formUsuario.classList.add("hidden");

    tituloFormulario.textContent = "Registrar Nuevo Usuario";
    btnGuardarUsuario.textContent = "Guardar Usuario";

    const campoContrasena = document.getElementById("usuario-contrasena");
    campoContrasena.required = true;
    formUsuario.querySelector('label[for="usuario-contrasena"]').textContent =
      "Contraseña";
    campoContrasena.placeholder = "Ingresa una Contraseña";

    await cargarUsuarios();
  } catch (error) {
    usuarioFeedback.textContent = error.message;
    usuarioFeedback.className = "is-error";
  }
});
async function cargarProyectos() {
  proyectosStatus.textContent = "Cargando proyectos...";
  listaProyectos.innerHTML = "";

  try {
    const proyectos = await AdminServices.getProyectos();

    if (proyectos.length === 0) {
      proyectosStatus.textContent = "No hay Proyectos Activos.";
      return;
    }

    proyectosStatus.textContent = `Se encontraron ${proyectos.length} Proyectos Activos.`;

    proyectos.forEach((proyecto) => {
      const tarjeta = document.createElement("article");
      tarjeta.classList.add("admin-user-card");

      const informacion = document.createElement("div");
      informacion.classList.add("admin-user-info");

      const titulo = document.createElement("strong");
      titulo.textContent = proyecto.titulo;

      const descripcion = document.createElement("span");
      descripcion.textContent = proyecto.descripcion || "Sin descripción";

      const id = document.createElement("span");
      id.textContent = `ID: ${proyecto.id}`;

      const acciones = document.createElement("div");
      acciones.classList.add("admin-user-actions");

      const btnEditar = document.createElement("button");
      btnEditar.textContent = "Editar";
      btnEditar.classList.add("secondary-button");
      btnEditar.type = "button";

      btnEditar.addEventListener("click", async () => {
        try {
          const proyectoCompleto = await AdminServices.getProyecto(proyecto.id);

          proyectoEditandoId = proyectoCompleto.id;

          document.getElementById("proyecto-titulo").value =
            proyectoCompleto.titulo;

          document.getElementById("proyecto-descripcion").value =
            proyectoCompleto.descripcion || "";

          document.getElementById("proyecto-valoracion").value =
            proyectoCompleto.valoracion ?? 0;

          document.getElementById("proyecto-division").value =
            proyectoCompleto.division_id;

          document.getElementById("proyecto-usuario").value =
            proyectoCompleto.usuario_id ?? "";

          proyectoFeedback.textContent = "";
          proyectoFeedback.className = "";

          formProyecto.querySelector("h3").textContent =
            `Editar proyecto: ${proyectoCompleto.titulo}`;

          formProyecto.classList.remove("hidden");

          formProyecto.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        } catch (error) {
          alert(error.message);
        }
      });

      const btnDarDeBaja = document.createElement("button");
      btnDarDeBaja.textContent = "Dar de Baja";
      btnDarDeBaja.classList.add("admin-button");
      btnDarDeBaja.type = "button";

      acciones.append(btnEditar, btnDarDeBaja);

      btnDarDeBaja.addEventListener("click", async () => {
        const motivo = prompt(
          `¿Por qué querés dar de baja el proyecto "${proyecto.titulo}"?`,
        );

        if (motivo === null) return;

        if (!motivo.trim()) {
          alert("Debés indicar un motivo para la baja.");
          return;
        }

        const confirmar = confirm(
          `¿Estás seguro de dar de baja "${proyecto.titulo}"?`,
        );

        if (!confirmar) return;

        try {
          await AdminServices.darDeBajaProyecto(proyecto.id, motivo.trim());

          alert("Proyecto dado de Baja Correctamente.");

          await cargarProyectos();
        } catch (error) {
          alert(error.message);
        }
      });

      informacion.append(titulo, descripcion, id);
      tarjeta.append(informacion, acciones);
      listaProyectos.appendChild(tarjeta);
    });
  } catch (error) {
    proyectosStatus.textContent = error.message;
  }
}

async function cargarProyectosBaja() {
  proyectosBajaStatus.textContent = "Cargando proyectos...";
  listaProyectosBaja.innerHTML = "";

  try {
    const proyectos = await AdminServices.getTodosProyectos();

    const proyectosBaja = proyectos.filter((proyecto) => !proyecto.activo);

    if (proyectosBaja.length === 0) {
      proyectosBajaStatus.textContent = "No hay proyectos dados de baja.";
      return;
    }

    proyectosBajaStatus.textContent = `Se encontraron ${proyectosBaja.length} proyectos dados de baja.`;

    proyectosBaja.forEach((proyecto) => {
      const tarjeta = document.createElement("article");
      tarjeta.classList.add("admin-user-card");

      const informacion = document.createElement("div");
      informacion.classList.add("admin-user-info");

      const titulo = document.createElement("strong");
      titulo.textContent = proyecto.titulo;

      const motivo = document.createElement("span");
      motivo.textContent = `Motivo de baja: ${proyecto.motivo_baja || "No especificado"}`;

      const id = document.createElement("span");
      id.textContent = `ID: ${proyecto.id}`;

      const acciones = document.createElement("div");
      acciones.classList.add("admin-user-actions");

      const btnReactivar = document.createElement("button");
      btnReactivar.textContent = "Reactivar";
      btnReactivar.classList.add("admin-button");
      btnReactivar.type = "button";

      btnReactivar.addEventListener("click", async () => {
        const confirmar = confirm(
          `¿Querés reactivar el proyecto "${proyecto.titulo}"?`,
        );

        if (!confirmar) return;

        try {
          await AdminServices.reactivarProyecto(proyecto.id);

          alert("Proyecto reactivado Correctamente.");

          await cargarProyectosBaja();
          await cargarProyectos();
        } catch (error) {
          alert(error.message);
        }
      });

      acciones.appendChild(btnReactivar);

      informacion.append(titulo, motivo, id);
      tarjeta.append(informacion, acciones);
      listaProyectosBaja.appendChild(tarjeta);
    });
  } catch (error) {
    proyectosBajaStatus.textContent = error.message;
  }
}

btnVerBajas.addEventListener("click", async () => {
  await cargarProyectosBaja();
});

formProyecto.addEventListener("submit", async (event) => {
  event.preventDefault();

  const proyecto = {
    titulo: document.getElementById("proyecto-titulo").value.trim(),
    descripcion:
      document.getElementById("proyecto-descripcion").value.trim() || null,
    valoracion:
      document.getElementById("proyecto-valoracion").value === ""
        ? null
        : Number(document.getElementById("proyecto-valoracion").value),
    division_id: Number(document.getElementById("proyecto-division").value),
    usuario_id:
      document.getElementById("proyecto-usuario").value === ""
        ? null
        : Number(document.getElementById("proyecto-usuario").value),
  };

  proyectoFeedback.textContent = "Actualizando proyecto...";
  proyectoFeedback.className = "";

  try {
    await AdminServices.actualizarProyecto(proyectoEditandoId, proyecto);

    proyectoFeedback.textContent = "Proyecto Actualizado Correctamente.";
    proyectoFeedback.className = "is-success";

    formProyecto.reset();
    formProyecto.classList.add("hidden");
    proyectoEditandoId = null;

    await cargarProyectos();
  } catch (error) {
    proyectoFeedback.textContent = error.message;
    proyectoFeedback.className = "is-error";
  }
});

btnCancelarProyecto.addEventListener("click", () => {
  formProyecto.reset();

  proyectoEditandoId = null;

  proyectoFeedback.textContent = "";
  proyectoFeedback.className = "";

  formProyecto.querySelector("h3").textContent = "Editar Proyecto";

  formProyecto.classList.add("hidden");
});

if (getAccessToken()) {
  cargarUsuarios();
  cargarDivisiones();
  cargarProyectos();
} else {
  usuariosStatus.textContent =
    "Inicia Sesion con una Cuenta Administradora para consultar los Usuarios.";

  divisionesStatus.textContent =
    "Inicia Sesion con una Cuenta Administradora para consultar las Divisiones.";

  proyectosStatus.textContent =
    "Inicia Sesion con una Cuenta Administradora para consultar los proyectos.";
}
