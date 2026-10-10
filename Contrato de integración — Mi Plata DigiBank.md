Contrato de integración — Mi Plata / DigiBank 

# Contrato de integración — Mi Plata / DigiBank 

Oct 8, 2026 · 

## Propósito 

Este contrato fija los nombres, estructuras y reglas que los tres usamos para que el código de todas las ramas se una y funcione como un solo programa. Antes de escribir un nombre nuevo de clase, método o archivo, se revisa aquí. Si algo no está, se acuerda en el equipo y se agrega. 

Cada decisión lleva un estado: 

|Estado|Significado|
|---|---|
|Confirmado|Lo exige el documento del profesor|
|Decisión del equipo|Lo acordamos nosotros y no contradice al profesor|
|Propuesta|Recomendación pendiente de que el equipo la<br>acepte|
|Pendiente|Hay que preguntarlo al profesor antes de<br>programarlo|



Equipo: Mateo, Juan y Sebastián. Repositorio: `Mathurtado/digibank` . 

## Alcance del sprint 

El 10 de octubre no es la entrega final: hay que demostrar progreso en GitHub, con ramas y commits de los tres integrantes. La meta de este sprint es que cada uno tenga su rama con trabajo real y que las clases base estén fusionadas en `developer` . 

|En este sprint|En sprints siguientes|
|---|---|
|Esqueleto común en<br>`developer`: clases con<br>métodos,<br>`index.html`,<br>`utilidades.js`,<br>`app.js`|Tarjeta de crédito con cuotas e intereses|
|Registro e inicio de sesión con contador y<br>bloqueo|CRUD de usuarios|
|Cuentas de ahorros y corriente: consignar y<br>retirar|Perfil y cambio de contraseña|



Page 1 of 7 

Contrato de integración — Mi Plata / DigiBank 

|En este sprint|En sprints siguientes|
|---|---|
|Consultar saldo y ver movimientos|Transferencias|
|Landing y estilos base|Diseño responsivo completo y documento<br>de evidencias|



Aplazar la tarjeta de crédito es decisión del equipo. Aplazar el CRUD, el perfil y las transferencias es una propuesta, para que el sprint quepa en el tiempo. Todo lo aplazado sigue siendo obligatorio para la entrega final. 

## Reglas de negocio 

Estas son las reglas que el código debe cumplir. Las marcadas como pendientes no se programan hasta tener respuesta, o se programan de forma provisional y se avisa en la revisión. 

Page 2 of 7 

Contrato de integración — Mi Plata / DigiBank 

### Registro 

|Regla|Estado|
|---|---|
|Se piden: número de identificación, nombre<br>completo, celular, nombre de usuario, contraseña<br>y confirmación de contraseña|Confirmado|
|El nombre de usuario es único. No se permiten<br>duplicados|Confirmado|
|El número de identificación es único: una<br>persona, un cliente|Decisión del equipo|
|El correo electrónico no se pide en este sprint,<br>porque el profesor no lo exige|Propuesta|
|Contraseña: mínimo 6 caracteres, con al menos<br>una letra y un número. No exige caracteres<br>especiales|Decisión del equipo|
|La confirmación debe ser igual a la contraseña|Confirmado|
|El cliente elige el tipo de cuenta al registrarse:<br>ahorros, corriente o ambas (al menos una,<br>máximo una de cada tipo)|Decisión del equipo; "ambas" es<br>propuesta|
|Las cuentas empiezan con saldo $0. No hay saldo<br>inicial ni límite de $1.000.000|Decisión del equipo|



Por qué "ambas": el profesor exige transferencias entre productos del mismo usuario. Si un cliente solo puede tener una cuenta, nunca podrá hacerlas. 

### Inicio de sesión 

|Regla|Estado|
|---|---|
|Se inicia sesión con nombre de usuario y<br>contraseña|Confirmado|
|Máximo tres intentos fallidos. Al tercero, la<br>cuenta se bloquea con un mensaje informativo|Confirmado|
|El contador de intentos es visible en el formulario|Confirmado|
|El bloqueo dura 5 minutos. Al vencer, el contador<br>vuelve a 0|Decisión del equipo|



Page 3 of 7 

Contrato de integración — Mi Plata / DigiBank 

|Regla|Estado|
|---|---|
|El bloqueo se guarda en el cliente, no en una|Decisión del equipo|
|variable global: fallar con un usuario no bloquea a<br>otro||
|Usuario inexistente o contraseña incorrecta<br>muestran el mismo mensaje: "Usuario o<br>contraseña incorrectos"|Decisión del equipo|
|Los datos viven mientras la página esté abierta.|Decisión del equipo (limitación|
|Al recargar se pierden usuarios y bloqueos|conocida)|



### Montos y operaciones 

|Regla|Estado|
|---|---|
|Todos los montos son enteros, sin decimales|Decisión del equipo|
|El usuario escribe solo dígitos y el sistema<br>agrega los puntos de miles mientras escribe|Decisión del equipo|
|Consignar: el monto debe ser mayor que 0|Confirmado|
|Retirar de ahorros: el monto no puede<br>superar el saldo|Confirmado|
|Retirar de ahorros: se aplica el interés del<br>1,5% mensual en el momento del retiro|Confirmado; cómo se calcula es pendiente|
|Retirar de corriente: se puede retirar hasta el<br>saldo más un 20% (sobregiro)|Confirmado|
|Retiro mínimo de $10.000|Propuesta: eliminarlo, porque el profesor no<br>lo pide|
|Una operación rechazada no cambia el saldo<br>ni crea un movimiento|Decisión del equipo|



### Movimientos 

|Regla|Estado|
|---|---|
|Cada movimiento guarda fecha y hora, tipo y valor|Confirmado|



Page 4 of 7 

Contrato de integración — Mi Plata / DigiBank 

|Regla|Estado|
|---|---|
|Cada movimiento guarda también el saldo<br>resultante|Decisión del equipo|
|El historial se muestra ordenado por fecha, del más<br>reciente al más antiguo|Confirmado|
|Los movimientos se guardan en un arreglo dentro|Confirmado|
|de cada cuenta||



## Convenciones de nombres 

Todo el código se escribe en español, sin tildes ni ñ en los nombres, para evitar errores al escribirlos. 

|Qué|Cómo se escribe|Ejemplo|
|---|---|---|
|Clases|PascalCase|`CuentaAhorros`,<br>`Cliente`|
|Variables, atributos y<br>métodos|camelCase|`nombreCompleto`,<br>`limiteRetiro()`|
|Constantes de reglas de<br>negocio|MAYUSCULAS con guion<br>bajo|`MAX_INTENTOS`,<br>`TASA_INTERES_AHORROS`|
|Atributos privados|`#`delante|`#saldo`,<br>`#contrasena`|
|Métodos que|empiezan por<br>`es`,<br>`esta`o|`estaBloqueado()`,|
|responden sí o no|`tiene`|`tieneCuenta()`|
|Archivos de clase|mismo nombre que la clase|`CuentaAhorros.js`|
|Archivos de interfaz|camelCase|`registro.js`,<br>`iniciarSesion.js`|
|`id`en el HTML|kebab-case con prefijo de<br>la sección|`registro-usuario`,<br>`panel-`<br>`saldo`|
|Clases CSS|kebab-case|`mensaje-error`,<br>`boton-`<br>`principal`|



### Constantes 

Los números del negocio se escriben una sola vez, en `utilidades.js` . Ninguna función escribe el número directamente. 

Page 5 of 7 

Contrato de integración — Mi Plata / DigiBank 

|Constante|Valor|Uso|
|---|---|---|
|`MAX_INTENTOS`|3|Intentos fallidos antes del bloqueo|
|`MINUTOS_BLOQUEO`|5|Duración del bloqueo|
|`MIN_CARACTERES_CONTRASENA`|6|Longitud mínima de la contraseña|
|`TASA_INTERES_AHORROS`|0.015|Interés de 1,5% en ahorros|
|`PORCENTAJE_SOBREGIRO`|0.2|Sobregiro de 20% en corriente|



### Textos fijos 

Los tipos de cuenta y de movimiento se escriben siempre igual, porque otros archivos los comparan: 

- Tipos de cuenta: `"ahorros"` , `"corriente"` . 

- Tipos de movimiento: `"consignacion"` , `"retiro"` , `"transferencia enviada"` , `"transferencia recibida"` . 

- Tipos de mensaje: `"exito"` , `"error"` , `"advertencia"` . 

La interfaz se encarga de mostrarlos con tildes y mayúsculas: "Consignación". 

## Arquitectura 

La aplicación es una sola página HTML con secciones que se muestran u ocultan: inicio, registro, inicio de sesión y panel. Así los datos no se pierden al pasar de una sección a otra. 

### Las tres capas 

1. **Clases (la lógica).** Contienen las reglas del negocio. Nunca usan `alert` , `prompt` ni `document` . Reciben datos y devuelven un resultado. 

2. **Archivos de interfaz.** Uno por módulo. Leen el formulario, llaman al método de la clase y muestran el mensaje en pantalla. 

3. **`app.js` .** Crea el banco una sola vez ( `const banco = new Banco()` ) y controla qué sección se ve. 

Regla de oro: si un archivo de clase contiene `document.` o `alert(` , está en la capa equivocada. 

Gracias a esta separación, las clases se pueden probar desde la consola del navegador antes de que exista el formulario. 

Page 6 of 7 

Contrato de integración — Mi Plata / DigiBank 

### Archivos y orden de carga 

No se usan `import` ni `export` . Los archivos se cargan con `<script>` al final de `index.html` , en este orden exacto, porque una clase hija necesita que su clase padre ya esté cargada: 

|Orden|Archivo|Responsable|
|---|---|---|
|1|`js/utilidades.js`|Mateo (esqueleto)|
|2|`js/clases/Cuenta.js`|Juan|
|3|`js/clases/CuentaAhorros.js`|Juan|
|4|`js/clases/CuentaCorriente.js`|Juan|
|5|`js/clases/Cliente.js`|Mateo|
|6|`js/clases/Banco.js`|Mateo|
|7|`js/interfaz/registro.js`|Mateo|
|8|`js/interfaz/iniciarSesion.js`|Mateo|
|9|`js/interfaz/operaciones.js`(consignar y<br>retirar)|Juan|
|10|`js/interfaz/consultas.js`(saldo y<br>movimientos)|Sebastián|
|11|`js/app.js`|Mateo (esqueleto)|



Además: `index.html` (estructura común en el esqueleto; cada uno completa su sección) y `css/estilos.css` (Sebastián). `TarjetaCredito.js` se agrega en un sprint posterior, después de `CuentaCorriente.js` . 

Como todos los archivos comparten el mismo espacio global, solo pueden ser globales: las clases, las constantes y funciones de `utilidades.js` , y la variable `banco` creada en `app.js` . Todo lo demás vive dentro de una clase o de una función. Si dos archivos declaran el mismo nombre global, el navegador muestra un error y la página deja de funcionar. 

Page 7 of 7 

