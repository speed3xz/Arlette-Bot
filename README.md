<h1 align="center">🎀 Arlette-Bot 💗</h1>  
<p align="center"><i>Bot de WhatsApp con temática de una waifu vampira</i></p>

<p align="center">
  <img src="https://raw.githubusercontent.com/speed3xz/Storage/main/Arlette-Bot/b859e5b0780d3eb3f3349f69ab524bcc.jpg" width="220"/>
</p>

### **`❕️ Información importante 🎀`**

**Arlette-Bot** es un bot de WhatsApp basado en Node.js que utiliza la librería **@whiskeysockets/Baileys**
Este bot ofrece una variedad de características para mejorar tu experiencia en WhatsApp.

🚫 Este proyecto NO está afiliado a WhatsApp ni WhatsApp LLC.
un bot hecho 100% independiente, la base del bot es de **Yuki bot** personalizado por **Speed3xz**.

#### Características
Configuración avanzada de grupos 
Bienvenidas personalizadas  
Herramientas útiles  
Juegos RPG (Gacha y Economía)  
Funciones de Inteligencia Artificial  
Descargas y búsquedas multi-plataforma  
Sub-Bots (JadiBot)  
Extensiones adicionales

<details>
 <summary><b> ➮ Funciones</b></summary>

> Bot en desarrollo si presenta alguna falla reportar al creador para darle una solución óptima.

- [x] Interacción con voz y texto
- [x] Configuración de grupo
- [x] antidelete, antilink, antispam, etc
- [x] Bienvenida personalizada
- [x] Juegos, tictactoe, mate, etc
- [x] Chatbot (simsimi)
- [x] Chatbot (autoresponder)
- [x] Crear sticker de image/video/gif/url
- [x] SubBot (Jadibot)
- [x] Buscador Google
- [x] Juego RPG
- [x] Personalizar imagen del menú
- [x] Descarga de música y video De YT
- [ ] Otros

</details>

### 💻 Instalación por plataforma

### **`➮ Instalación por termux`**
<details>
<summary><b>✰ Instalación Manual</b></summary>

> *Comandos para instalar de forma manual*
```bash
termux-setup-storage
```
```bash
apt update && apt upgrade && pkg install -y git nodejs ffmpeg imagemagick yarn
```
```bash
git clone https://github.com/speed3xz/Arlette-Bot && cd Arlette-Bot
```
```bash
yarn install
```
```bash
npm install
```
```bash
npm start
```
> *Si aparece **(Y/I/N/O/D/Z) [default=N] ?** use la letra **"y"** y luego **"ENTER"** para continuar con la instalación.*
</details>

<details>
  <summary><b>🜸 Comandos para mantener más tiempo activo el Bot</b></summary>

> *Ejecutar estos comandos dentro de la carpeta YukiBot-MD*
```bash
termux-wake-lock && npm i -g pm2 && pm2 start index.js && pm2 save && pm2 logs 
``` 
#### Opciones Disponibles
> *Esto eliminará todo el historial que hayas establecido con PM2:*
```bash 
pm2 delete index
``` 
> *Si tienes cerrado Termux y quiere ver de nuevo la ejecución use:*
```bash 
pm2 logs 
``` 
> *Si desea detener la ejecución de Termux use:*
```bash 
pm2 stop index
``` 
> *Si desea iniciar de nuevo la ejecución de Termux use:*
```bash 
pm2 start index
```
---- 
### En caso de detenerse
> _Si despues que ya instalastes el bot y termux te salta en blanco, se fue tu internet o reiniciaste tu celular, solo realizaras estos pasos:_
```bash
cd && cd Arlette-Bot && npm start
```
----
### Obtener nuevo código QR 
> *Detén el bot, haz click en el símbolo (ctrl) [default=z] usar la letra "z" + "ENTER" hasta que salga algo verdes similar a: `Arlette-Bot $`*
> **Escribe los siguientes comandos uno x uno :**
```bash 
cd && cd Arlette-Bot && rm -rf sessions/Principal && npm run qr
```
----
### Obtener nuevo código de teléfono 
```bash 
cd && cd Arlette-Bot && rm -rf sessions/Principal && npm run code
```
</details>

<details>
<summary><b>❀ Actualizar Arlette-Bot-MD</b></summary>

> **Utiliza esta opción únicamente si deseas actualizar a la última versión de Arlette-Bot. Hemos implementado un método ingenioso mediante comandos para realizar la actualización, pero ten en cuenta que al usarla se eliminarán todos los archivos de la versión actual y se reemplazarán con los de la nueva versión. Solo se conservará la base de datos, por lo que será necesario volver a vincular el Bot.**  

**Comandos para actualizar Arlette-Bot-MD de forma automática**

```bash
grep -q 'bash\|wget' <(dpkg -l) || apt install -y bash wget && wget -O - https://raw.githubusercontent.com/Speed3xz/Arlette-Bot/main/termux.sh | bash 
```
**✰ Volverte owner del Bot**

*Si después de instalar el bot e iniciar la sesión (deseas poner tu número es la lista de owner pon este comando:*

```bash
cd && cd Arlette-Bot && nano settings.js
```
#### Para que no pierda su progreso en Arlette-Bot, estos comandos realizarán un respaldo de su `database.json` y se agregará a la versión más reciente.
> *Estos comandos solo funcionan para TERMUX, REPLIT, LINUX*.                > 💡 Puedes usar [Termux Widget](https://f-droid.org/packages/com.termux.widget/) para lanzar el bot más rápido desde la pantalla de inicio.
</details>                                                                 

### **`🖥️ Windows (Instalador. exe)`**

> ✅ Recomendado para usuarios sin experiencia técnica.

1. Descarga el instalador desde el siguiente enlace:  
   [🔗 Descargar Arlette-Bot para Windows](https://github.com/speed3xz/Arlette-Bot/releases/download/v2.2.1/Alya-installer-x64-x86.exe)
2. Ejecuta el archivo y sigue los pasos del asistente.
3. El bot se iniciará automáticamente tras completar la instalación.
---

## 🧑‍💻 Desarrollador Principal

<p align="center">
  <a href="https://github.com/Speed3xz">
    <img src="https://github.com/speed3xz.png" width="130" height="130" alt="Speed3xz 🎀"/>
    <br>
    <strong>Speed3xz 🎀</strong>
  </a>
</p>

---
