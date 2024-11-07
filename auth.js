import { auth, db, storage } from "/firebase.js"
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js"
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js"
import { signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js"
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js"
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js"
import { GithubAuthProvider } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js"
import {
  ref,    //Guarda la referencia de la carpeta donde se subira la imagen
  uploadBytes,    //Sube la imagen a la referencia indicada
  getDownloadURL,  //Consigue la URL del archivo subido
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js";
import {
  getDoc, //Este faltaba
  doc,    //
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { resizeImage, } from "./utilitarios.js";

//Variable globales
let avatarUrl = "";

document.getElementById("form-singup").addEventListener("submit", async (e) => {
  e.preventDefault()

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const nombres = document.getElementById("signup-nombres").value

  try {
    const credentials = await createUserWithEmailAndPassword(auth, email, password);
    const user = credentials.user;
    console.log(user.uid)
    await setDoc(doc(db, "usuarios", user.uid), {
      email: email,
      password: password,
      nombres: nombres,
      avatarUrl: avatarUrl
    });

    signupForm.reset()
    const modalSignup = document.getElementById("modal-signup")
    const modal = bootstrap.Modal.getInstance(modalSignup);
    modal.hide();
    console.log("creado!")
    //mas codigo

  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(error.code);
    console.log("ERROR!")
    //Tratamiento de errores
    if (error.code === "auth/email-already-in-use") {
      alert("Usuario ya registrado!")
    } else if (error.code === "auth/weak-password") {
      alert("Su contraseña debe tener 6 caracteres minimos")
    } else if (error.code === "auth/invalid-email") {
      alert("Correo Invalido!")
    } else if (error.code) {
      alert("Algo fue mal!")
    }
  };
})

//Subir imagen Crear Usuario
document.getElementById('signup-avatar').addEventListener('change', async (e) => {
  const file = e.target.files[0];

  if (file) {
    const resizedAvatar = await resizeImage(file, 150, 150); // Redimensiona la imagen
    const avatarPath = `avatars/${resizedAvatar.name}`  // Se define la ruta del archivo
    await uploadBytes(ref(storage, avatarPath), resizedAvatar); // Sube el archivo a Storage
    avatarUrl = await getDownloadURL(ref(storage, avatarPath));
    document.getElementById('uploaded-Avatar').innerHTML = `<img src="${avatarUrl}" alt="Imagen subida" style="width:100px">`;
  } else {
    alert("Por favor, selecciona un archivo.");
  }
});




//Cuando se legue el usuario
//cada vez que ocurre un cambio de sesión, se ejecuta onAuthStateChanged
onAuthStateChanged(auth, async (user) => {
  const outlinks = document.querySelectorAll(".logged-out");
  const inlinks = document.querySelectorAll(".logged-in");
  const divBienvenida = document.getElementById("bienvenida");
  const divPublicaciones = document.getElementById("publicaciones");

  console.log(outlinks);
  console.log(inlinks);

  if (user) { //si la sesión está iniciada
    outlinks.forEach(link => link.style.display = "none");
    inlinks.forEach(link => link.style.display = "block");
    divBienvenida.style.display = "none";
    //divPublicaciones.style.display = "block";
    document.getElementById("barra").classList.remove("bg-light")
    document.getElementById("barra").style.backgroundColor = "#CBB2CD"
    console.log( document.getElementById("barra").style.backgroundColor);
  } else { //sino (no está inciada)

    inlinks.forEach(link => link.style.display = "none");
    outlinks.forEach(link => link.style.display = "block");
    divBienvenida.style.display = "block";
    //divPublicaciones.style.display = "none";
    document.getElementById("barra").style.backgroundColor = ""
  document.getElementById("barra").classList.add("bg-light")
  }
})

//Deslogueo

document.getElementById("logout").addEventListener("click", async () => {
  await signOut(auth);
  console.log("Usuario cerro sesion")
})

//Formulario de logueo

document.getElementById("form-signin").addEventListener("submit", async (e) => {

  e.preventDefault();
  const emailLogin = document.getElementById("email-signin").value
  const passwordLogin = document.getElementById("password-signin").value

  console.log(emailLogin, passwordLogin)

  try {
    const credentials = await signInWithEmailAndPassword(auth, emailLogin, passwordLogin);
    console.log("logueado")

    //Cerrar modal
    const modalSignin = document.getElementById("modal-signin")
    const modal = bootstrap.Modal.getInstance(modalSignin);
    modal.hide();

  } catch (error) {
    console.log(error.code)
  }
})

//Logueo con google
document.getElementById("google-boton").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider()
  
  try {
    const credentials = await signInWithPopup(auth, provider)
    const user = credentials.user;
    // Referencia al documento del usuario en Firestore
    const userDocRef = await doc(db, "usuarios", user.uid);
    // Verificar si el documento ya existe
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      // Si no existe, crear un nuevo documento con información adicional
      await setDoc(userDocRef, {
        nombres: user.displayName,
        email: user.email,
        avatarUrl: user.photoURL 
        //fecha: new Date(),
      });
      location.reload(true); //refresca la pagina para cargar los nuevos datos de usuario
    } else {
      console.log("El usuario ya existe en Firestore");
    }
    //Ocultar modal de singin
    const modalSignin = document.getElementById("modal-signin")
    const modal = bootstrap.Modal.getInstance(modalSignin);
    modal.hide();

  } catch (error) {
    console.log(error.code)
  }
})

//Logueo con Github
document.getElementById("github-boton").addEventListener("click", async (e) => {
  e.preventDefault()
  const provider = new GithubAuthProvider();
  try {
    const credentials = await signInWithPopup(auth, provider)

    //Ocultar modal de singin
    const modalSignin = document.getElementById("modal-signin")
    const modal = bootstrap.Modal.getInstance(modalSignin);
    modal.hide();

  } catch (error) {
    console.log(error.code)
  }
})
