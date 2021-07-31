(function () {
  var climas = [],
    //Funciones
    construirClima = function (openWheatherResponse) {
      var ciudadId = openWheatherResponse.id;
      var nombreCiudad = openWheatherResponse.name;
      var infoClimaMain = openWheatherResponse.weather[0].main;
      var infoClima =
        openWheatherResponse.weather[0].description.charAt(0).toUpperCase() +
        openWheatherResponse.weather[0].description.slice(1);

      var temperatura = openWheatherResponse.main.temp;
      var humedad = openWheatherResponse.main.humidity;

      return {
        ciudadId: ciudadId,
        nombreCiudad: nombreCiudad,
        infoClimaMain: infoClimaMain,
        infoClima: infoClima,
        temperatura: temperatura,
        humedad: humedad,
        timeOut: setTimeout(function () {
          generarAlertaPorFaltaDeActualizacion(nombreCiudad);
        }, 1800000),
      };
    },
    mostarCiudadMasHumeda = function () {
      const ciudadMasHumeda = climas.reduce(
        (max, clima) => (clima.humedad > max.humedad ? clima : max),
        climas[0]
      );
      document.getElementById(
        "ciudadMasHumeda"
      ).innerHTML = `La ciudad mas humeda es: ${ciudadMasHumeda.nombreCiudad}`;
    },
    mostarCiudadMasFría = function () {
      const ciudadMasFria = climas.reduce(
        (max, clima) => (clima.temperatura < max.temperatura ? clima : max),
        climas[0]
      );
      document.getElementById(
        "ciudadMasFria"
      ).innerHTML = `La ciudad mas fría es: ${ciudadMasFria.nombreCiudad}`;
    },
    generarAlertaPorFaltaDeActualizacion = function (nombreCiudad) {
      document.getElementById(
        "toastBody"
      ).innerHTML = `La ciudad ${nombreCiudad} lleva 30 minutos sin actualizarse`;
      let fechaDeHoy = new Date();
      let horaActual =
        fechaDeHoy.getHours() +
        ":" +
        fechaDeHoy.getMinutes() +
        ":" +
        fechaDeHoy.getSeconds();
      document.getElementById("hora").innerHTML = horaActual;
      var opciones = { animation: true, delay: 2000, autohide: false };
      var toastHTMLElement = document.getElementById("liveToast");
      var toastElement = new bootstrap.Toast(toastHTMLElement, opciones);
      toastElement.show();
    },
    actualizarObjetoClima = function (clima) {
      indexDelClimaViejo = climas.findIndex(
        (c) => c.ciudadId == clima.ciudadId
      );
      timeOutId = climas[indexDelClimaViejo].timeOut;
      clearTimeout(timeOutId);
      climas.splice(indexDelClimaViejo, 1, clima);
    },
    actualizarImagenYCiudadMasFriaYMasHumeda = function (clima) {
      let cardBody = document.getElementById(`${clima.ciudadId}.body`);
      let imageSelection =
        "./img/" + clima.infoClimaMain.replace(/ /g, "") + ".png";
      cardBody.style.background = `url(${imageSelection}) no-repeat center center`;
      cardBody.style.backgroundSize = "50% 100%";
      mostarCiudadMasHumeda();
      mostarCiudadMasFría();
    },
    mostrarClima = function (clima) {
      var infoTemperaturaYHumedad =
        clima.temperatura + "° " + clima.humedad + "% RH";
      let respuesta = document.getElementById("respuesta");
      respuesta.innerHTML += `<div class="col">
    					<div id="${clima.ciudadId}" class="card border-info mb-3 col-12 col-sm-12 col-md-6 " style="min-width: 100%;">
        					<div id="${clima.ciudadId}.nombre" class="card-header">${clima.nombreCiudad}</div>
        					<div id="${clima.ciudadId}.body" class="card-body">
            						<h5 id="${clima.ciudadId}.clima" class="card-title">${clima.infoClima}</h5>
            						<p id="${clima.ciudadId}.temperaturaYHumedad" class="card-text">${infoTemperaturaYHumedad}</p>
        					</div>
   					</div>
    				</div>`;

      actualizarImagenYCiudadMasFriaYMasHumeda(clima);
    },
    obtenerClimaCallback = function (myRequest) {
      let info = JSON.parse(myRequest.responseText);
      let clima = construirClima(info);
      let ciudad = document.getElementById(clima.ciudadId);

      if (!ciudad) {
        climas.push(clima);
        mostrarClima(clima);
      } else {
        actualizarObjetoClima(clima);
        document.getElementById(clima.ciudadId + ".clima").innerHTML =
          clima.infoClima;
        document.getElementById(
          clima.ciudadId + ".temperaturaYHumedad"
        ).innerHTML = clima.temperatura + "° " + clima.humedad + "% RH";
        actualizarImagenYCiudadMasFriaYMasHumeda(clima);
      }
    },
    obtenerClima = function (ciudad) {
      document.getElementById("ciudad").value = "";
      let myRequest = new XMLHttpRequest();
      let url =
        "http://api.openweathermap.org/data/2.5/weather?" +
        (isNaN(ciudad) ? "q=" : "id=") +
        ciudad +
        "&units=metric&appid=755ad5d1ddb00eee4de413a798ec1abd";
      myRequest.addEventListener("load", () => obtenerClimaCallback(myRequest));
      myRequest.open("GET", url);
      myRequest.send();
    },
    actualizarClimas = function () {
      climas.forEach((c) => obtenerClima(c.ciudadId));
    },
    setearActualizacionAutomatica = function (intervalId) {
      let isChecked = document.getElementById(
        "actualizarAutomaticamente"
      ).checked;
      if (isChecked) {
        intervalId = window.setInterval(() => actualizarClimas(), 300000);
      } else {
        clearInterval(intervalId);
      }
      return intervalId;
    },
    borrarClimas = function () {
      climas = [];
      let respuesta = document.getElementById("respuesta");
      respuesta.innerHTML = "";
      document.getElementById("ciudadMasFria").innerHTML = "";
      document.getElementById("ciudadMasHumeda").innerHTML = "";
    },
    borrarUnClima = function (nombre) {
      document.getElementById("ciudad").value = "";
      let respuesta = document.getElementById("respuesta");
      respuesta.innerHTML = "";
      climas = climas.filter((c) => c.nombreCiudad != nombre);
      climas.forEach((c) => mostrarClima(c));
    },
    ordenarClimasConFuncion = function (f) {
      climas.sort((a, b) => (f(a) > f(b) ? 1 : f(b) > f(a) ? -1 : 0));
    },
    ordenar = function () {
      let respuesta = document.getElementById("respuesta");
      respuesta.innerHTML = "";
      let criterioDeOrdenamiento = document.getElementById(
        "criterioDeOrdenamiento"
      );
      var criterioDeOrdenamientoValue =
        criterioDeOrdenamiento.options[criterioDeOrdenamiento.selectedIndex]
          .value;

      switch (criterioDeOrdenamientoValue) {
        case "1":
          ordenarClimasConFuncion((c) => c.temperatura);
          break;
        case "2":
          ordenarClimasConFuncion((c) => c.humedad);
          break;
        case "3":
          ordenarClimasConFuncion((c) => c.nombreCiudad);
          break;
        default:
          ordenarClimasConFuncion((c) => c.ciudadId);
          break;
      }
      climas.forEach((c) => mostrarClima(c));
    },
    comprobarLocalStorage = function () {
      var test = "test";
      try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    },
    init = function () {
      window.onload = function () {
        if (comprobarLocalStorage()) {
          let data = localStorage.getItem("data");
          if (data !== null) {
            climas = JSON.parse(data);
            climas.forEach((c) => mostrarClima(c));
          }

          let isCheked = localStorage.getItem("actualizarAutomaticamente");
          if (isCheked !== null) {
            document.getElementById("actualizarAutomaticamente").checked =
              JSON.parse(isCheked);
          }
        } else {
          alert("El local storage se encuentra bloqueado!");
        }

        /* Podría poner una llamada a actualizar climas acá
           para que cuando se carguen también se actualicen,
           y por lo tanto se activen las alertas, de falta de
           actualización, pero elijo no hacerlo, y que sea el 
           usuario quién tome la decisión de actualizar o no.*/

        let invervalID = 0;
        invervalID = setearActualizacionAutomatica(invervalID);
        let actualizarAutomaticamente = document.getElementById(
          "actualizarAutomaticamente"
        );
        actualizarAutomaticamente.addEventListener(
          "change",
          () => (invervalID = setearActualizacionAutomatica(invervalID))
        );
      };

      window.addEventListener("beforeunload", (e) => {
        e.preventDefault();
        if (comprobarLocalStorage()) {
          let isChecked = document.getElementById(
            "actualizarAutomaticamente"
          ).checked;
          localStorage.setItem(
            "actualizarAutomaticamente",
            JSON.stringify(isChecked)
          );
          localStorage.setItem("data", JSON.stringify(climas));
        }
        return undefined;
      });

      let ingresoCiudad = document.getElementById("ingresoDeCiudad");
      ingresoCiudad.addEventListener("click", () =>
        obtenerClima(document.getElementById("ciudad").value)
      );

      let actualizar = document.getElementById("actualizar");
      actualizar.addEventListener("click", () => actualizarClimas());

      let limpiar = document.getElementById("limpiar");
      limpiar.addEventListener("click", () => borrarClimas());

      let borrar = document.getElementById("borrar");
      borrar.addEventListener("click", () =>
        borrarUnClima(document.getElementById("ciudad").value)
      );

      let ordenarElementos = document.getElementById("ordenar");
      ordenarElementos.addEventListener("click", () => ordenar());
    };

  init();
})();
