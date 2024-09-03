async function loginEntrada()
{
	var usuario = $('#usuario').val();
	var contrasenia = $('#password').val();
	var data      = {
			usuario: usuario,
			contrasenia: contrasenia
	};

	console.log(data);
	$.ajax({
        url : '/api/getUsuario',
        data : data,
        method : 'post',
        dataType : 'json',
        success : function(response){
            console.log(response.resultado);
            if (response.resultado == "OK") 
            {
            		window.location.href = "/?1";
            }
            else
            {
            	alert("Usuario o contraseña incorrectos");
            }

        },
        error: function(error){
            console.log("Se produjo un Error en la consulta.");
        }
    });

}

async function valida()
{
	$.ajax({
        url : '/reporte',
        method : 'get',
        dataType : 'json',
        success : function(response){
            console.log(response.resultado);
        },
        error: function(error){
            console.log("Se produjo un Error en la consulta.");
        }
    });
}