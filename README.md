# SiwBot

## Introducción

Este documento detalla el proceso del chatbot de SiwCargo al 19/06 y breves detalles acerca de como continuarlo.

# Estado Actual

## Funcionalidades Implementadas

1.  Validación de Entrada del Usuario:
    -Validación de fechas.
    -Validación de países y ciudades.

2.  Flujo Conversacional:
    -Proceso paso a paso guiado para recolectar información del usuario.
    -Manejo de advertencias y mensajes de error personalizados.

3.  Interfaz Personalizable:
    -Colores y avatares personalizados, y fácilmente personalizables.
    -Opciones de mensajes y botones.

4.  Manejo de Archivos:
    -Soporte para la subida de archivos PDF.

# Estructura del Proyecto

El chatbot está compuesto por varios componentes y funciones claves. A continuación, se describe cada uno de ellos:

## Componentes Principales

1. ChatForm: Componente principal que maneja el estado y el flujo del chatbot.
2. validations.js: Archivo que contiene la lógica para validar entradas del usuario, como fechas.
3. countries.js: Contiene información y funciones relacionadas con países, como la búsqueda y validación de países.

### Estructura del Proyecto

La estructura de las carpetas del proyecto es la siguiente:

```
├── public
├── src
   ├── assets
   ├── components
   ├── services
```

## Instrucciones para su uso

1. Clonar el proyecto `git clone git@bitbucket.org:siwcargodev/siwbot`
2. Acceder al directorio `cd siwbot`
3. Instalar las dependencias con `npm i`
4. Iniciar el proyecto con `npm run dev`
5. Abrir el navegador en `http://localhost:5173/#/propuestas/cambios/:idCert`
