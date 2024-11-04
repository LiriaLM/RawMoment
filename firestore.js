import {
    getDocs,        //
    getDoc,
    collection, //
    doc,    //
    addDoc, //
    onSnapshot, //  Escucha los cambios en una coleccion y da una respuesta
    deleteDoc,   // Elimina un documento de un coleccion
    updateDoc   // Actualiza un documento de una coleccion
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { db, auth, storage } from "./firebase.js"
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
    ref,    //Guarda la referencia de la carpeta donde se subira la imagen
    uploadBytes,    //Sube la imagen a la referencia indicada
    getDownloadURL,  //Consigue la URL del archivo subido
    deleteObject,   //Elminia un archivo de una ubicacion con su 
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js";
import { resizeImage, formatoFechaHora } from "./utilitarios.js";

//Cuando el usurio se autentique cargar los post
const listaPost = document.getElementById("posts");
const listaPostOtros = document.getElementById("posts-otros");
const usuario = document.getElementById("user");
let id = ""; //El id del post
let downloadURL = "";
let userEmail = "";
let usuarioId = "";

onAuthStateChanged(auth, async (user) => {
    if (user) { //Si el usuario está logueado, entonces ....
        userEmail = user.email;
        //Conseguir datos de usuario actual de la base de datos
        const docUser = await getDoc(doc(db, "usuarios", user.uid));
        const usuario = docUser.data();
        usuarioId = docUser.id;
        document.getElementById("quePiensasBtn").innerText = `PUBLICAR`;
        document.getElementById("avatar-foto").src = usuario.avatarUrl;
        //
        //LLamar al nombre del usurario en el boton que estas pensando
        await onSnapshot(collection(db, "posts"), (Querysnapshot) => {

            var documentos = Querysnapshot.docs //TODOS LOS DOCS

            //Columna izq: mis post
            let misPosts = documentos.filter(function (doc) { return user.email == doc.data().userEmail });
            misPosts = misPosts.sort((a, b) => b.data().fecha.toDate().getTime() - a.data().fecha.toDate().getTime())
            pintarPost(misPosts);
            console.log(misPosts)

            //Columna der: otros post
            let otrosPosts = documentos.filter(function (doc) { return user.email != doc.data().userEmail });
            otrosPosts = otrosPosts.sort((a, b) => b.data().fecha.toDate().getTime() - a.data().fecha.toDate().getTime())
            pintarPostOtros(otrosPosts);
            console.log(otrosPosts)
            //Columna

            //Elimiar Post
            const btnsDelete = document.querySelectorAll(".btn-delete");

            btnsDelete.forEach((btn) => {
                btn.addEventListener('click', async (e) => {
                    try {
                        await deletePost(e.target.dataset.id)
                    } catch (error) {
                        alert(error.code)
                    }
                })
            });

            //Editar Post
            const btnsEdit = document.querySelectorAll(".btn-edit")

            btnsEdit.forEach((btn) => {
                btn.addEventListener('click', async (e) => {
                    id = e.target.dataset.id //Actualizando el id
                    const doc = await getPost(id)
                    const post = doc.data()

                    document.getElementById("editarPost-titulo").value = post.titulo
                    document.getElementById("editarPost-descripcion").value = post.descripcion
                    console.log(post.imagenURL)
                    document.getElementById('editImage').innerHTML = `<img style="width:100%" src="${post.imagenURL}"/>`

                    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("modal-editarPost"))
                    modal.show()
                })
            })

            //Likear post
            const btnsLike = document.querySelectorAll(".btn-like");

            btnsLike.forEach((btn) => {
                btn.addEventListener('click', async (e) => {

                    let id = btn.getAttribute("data-id");

                    const doc = await getPost(id);
                    const post = doc.data();
                    if (post.personasLiked.includes(userEmail)) {//si mi correo dio like
                        //borrar de arreglo DISLIKE
                        //se elimina mi correo del arreglos usando filter ya que Pov solo agarra el ultimo
                        post.personasLiked = post.personasLiked.filter(email => email != userEmail);


                    } else { //si el correo no esta
                        //agregarlo a like LIKE
                        post.personasLiked.push(userEmail);
                    }

                    updatePost(id, post); // se actualiza en firestore (agregar o eiminar email)

                })
            });


        })
        //const posts = await getDocs(collection(db, "posts"))

    } else {
        listaPost.innerHTML = "Debes loguearte para ver los post"
    }
})

function pintarPost(datos) {
    if (datos.length) {
        let html = ''
        datos.forEach(doc => {
            const post = doc.data()
            let iconoLike = "";
            if (post.personasLiked.includes(userEmail)) { //deberia pintarse la mano
                iconoLike = `<i class="bi bi-heart-fill"></i>`
            } else {//deberia despintarse
                iconoLike = `<i class="bi bi-heart"></i>`
            }

            const li = `
                <li class="list-group-item list-group-item-action list-group-item-dark "  >
                    <h4>${post.userEmail} publicó: </h4>
                    <p>${formatoFechaHora(post.fecha.toDate())}</p>
                  <h5>${post.titulo}</h5>
                  <p>${post.descripcion}</p>
                  <img src="${post.imagenURL}" style="width:100%" />
                  <button class="btn-delete" data-id="${doc.id}">Delete</button>
                  <button class="btn-edit" data-id="${doc.id}">Edit</button>
                  <button class="btn-like" data-id="${doc.id}">${iconoLike}</button>
                   <p> A ${post.personasLiked.length} personas les gusta esto. </p>
                </li>
                `
            html += li
        });
        listaPost.innerHTML = html
    } else {
        listaPost.innerHTML = `<h1>Aun no hay posts que mostrar</h1>`
    }
}

//AQUI SE IMPRIMEN LOS POSTS DE LOS OTROS USUARIOS

function pintarPostOtros(datos) {
    if (datos.length) {
        let html = ''
        datos.forEach(doc => {
            const post = doc.data()
            let iconoLike = "";
            if (post.personasLiked.includes(userEmail)) { //deberia pintarse la mano
                iconoLike = `<i class="bi bi-heart-fill"></i>`
            } else {//deberia despintarse
                iconoLike = `<i class="bi bi-heart"></i>`
            }
            const li = `
                <li class="list-group-item list-group-item-action list-group-item-dark ">
                  <h4>${post.userEmail} publicó: </h4>
                  <p>${formatoFechaHora(post.fecha.toDate())}</p>
                  <h5>${post.titulo}</h5>
                  <p>${post.descripcion}</p>
                  <img src="${post.imagenURL}" style="width:100%" />
                  <button class="btn-delete" data-id="${doc.id}">Delete</button>
                  <button class="btn-edit" data-id="${doc.id}">Edit</button>
                  <button class="btn-like" data-id="${doc.id}">${iconoLike}</button>´
                  <p> A ${post.personasLiked.length} personas les gusta esto. </p>
                </li>
                `
            html += li
        });
        listaPostOtros.innerHTML = html
    } else {
        listaPostOtros.innerHTML = `<h1>Aun no hay posts que mostrar</h1>`
    }
}







//CrearPost
const postForm = document.getElementById("form-createPost")

postForm.addEventListener("submit", (e) => {
    e.preventDefault()


    const titulo = document.getElementById("crearPost-titulo").value
    const descripcion = document.getElementById("crearPost-descripcion").value
    const imagenURL = downloadURL
    const fecha = new Date()
    const personasLiked = [];

    savePost(titulo, descripcion, imagenURL, fecha, userEmail, personasLiked) //Crea Post

    postForm.reset() //Resetear formulario
    document.getElementById('uploadedImage').innerHTML = "";

    //Ocultar Modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("modal-crearPost"))
    modal.hide() //Ocultar Modal
})

//Actualizar Post
const editarPostForm = document.getElementById('form-editarPost');

editarPostForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const titulo = document.getElementById("editarPost-titulo").value
    const descripcion = document.getElementById("editarPost-descripcion").value
    const imagenURL = downloadURL

    updatePost(id, { titulo, descripcion, imagenURL }) //Actualiza el Post

    editarPostForm.reset();

    //Ocultar Modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("modal-editarPost"))
    modal.hide() //Ocultar Modal
})

// Subir Imagen Crear Post
document.getElementById('fileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        try {
            downloadURL = await uploadImage(file); //Se optine la url de la imagen
            document.getElementById('uploadedImage').innerHTML = `<img src="${downloadURL}" alt="Imagen subida" style="width:100%">`;
        } catch (error) {
            console.error('Error en la carga:', error);
        }
    } else {
        alert("Por favor, selecciona un archivo.");
    }
});

// Subir Imagen Editar Post
document.getElementById('editFileInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        try {
            downloadURL = await uploadImage(file); //Se optine la url de la imagen
            document.getElementById('editImage').innerHTML = `<img src="${downloadURL}" alt="Imagen subida" style="width:100%">`;
        } catch (error) {
            console.error('Error en la carga:', error);
        }
    } else {
        alert("Por favor, selecciona un archivo.");
    }
});




async function uploadImage(file) {
    const resizedImage = await resizeImage(file, 500, 500); // Cambia 800, 800 por el tamaño máximo deseado
    const storageRef = ref(storage, `images/${file.name}`);

    await uploadBytes(storageRef, resizedImage); // Subir la imagen
    return await getDownloadURL(storageRef); // Obtener la URL de descarga
}



//Funciones reutilizables de firestore

//Guardar Post
const savePost = (titulo, descripcion, imagenURL, fecha, userEmail, personasLiked) => {
    addDoc(collection(db, 'posts'), { titulo, descripcion, imagenURL, fecha, userEmail, personasLiked })
}

const deletePost = (id) => deleteDoc(doc(db, "posts", id))

const getPost = (id) => getDoc(doc(db, "posts", id))

const updatePost = (id, newFields) => updateDoc(doc(db, "posts", id), newFields)