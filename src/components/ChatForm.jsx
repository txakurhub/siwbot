import { useState } from "react";
import ChatBot from "react-chatbotify";
import { validateDate } from "./validations";
import botAvatar from "../assets/siwcargo.png";
import {
  allCountries,
  forbiddenCountries,
  getCitiesByCountry,
  searchCountry,
} from "./countries";

const ChatForm = () => {
  const [form, setForm] = useState({});

  const allowedCountryCodes = Object.keys(allCountries).filter(
    (code) => !Object.hasOwnProperty.call(forbiddenCountries, code)
  );
  const username = "txakur";
  getCitiesByCountry(allowedCountryCodes, username);

  const flow = {
    start: {
      message:
        "Bienvenido, este es el asistente de carga de SIW Cargo, ¿Qué tipo de cobertura desea tomar?",
      options: [
        "Multimodal marítimo",
        "Libre avería particular",
        "Terrestre desde puerto",
        "Terrestre",
        "Responsabilidad civil al transportista",
      ],
      chatDisabled: true,
      function: (params) => handleInputChange("coverageType", params.userInput),
      path: "operationNumber",
    },
    operationNumber: {
      message:
        "Indique un número de operación con el que desee identificar la operación:",
      user: true,
      function: (params) =>
        handleInputChange("operationNumber", params.userInput),
      path: "consignee",
    },
    consignee: {
      message: "¿Quién es el consignee según la factura comercial?",
      user: true,
      function: (params) => handleInputChange("consignee", params.userInput),
      path: "shipper",
    },
    shipper: {
      message: "¿Y el shipper?",
      user: true,
      function: (params) => handleInputChange("shipper", params.userInput),
      path: "originCountry",
    },
    originCountry: {
      message: "¿Cuál es el país de origen?",
      // consultar si el país es prohibido
      // caso negativo llamar a la api de ciudades
      user: true,
      path: async (params) => {
        if (searchCountry(params.userInput)) {
          handleInputChange("originCountry", params.userInput);
          return "originCity";
        }
        await params.injectMessage(
          "No pude entender el país ingresado, podrías escribirlo nuevamente?"
        );
        return;
      },
    },
    originCity: {
      message: "¿Desde qué ciudad?",
      // consultar si la ciudad existe
      user: true,
      function: (params) => handleInputChange("originCity", params.userInput),
      path: "destinationCountry",
    },
    destinationCountry: {
      message: "¿Cuál es el país de destino?",
      user: true,
      function: (params) =>
        handleInputChange("destinationCountry", params.userInput),
      path: "destinationCity",
    },
    destinationCity: {
      message: "¿A qué ciudad?",
      user: true,
      function: (params) =>
        handleInputChange("destinationCity", params.userInput),
      path: "departureDate",
    },
    departureDate: {
      message: "¿Cuándo saldrá su carga? (DD/MM/AAAA)",
      user: true,
      function: (params) =>
        handleInputChange("departureDate", params.userInput),
      path: async (params) => {
        if (
          validateDate(params.userInput) !== true
          // && isAllowed(country)
        )
          if (validateDate(params.userInput)) {
            return "containerCount";
          }
        await params.injectMessage(
          "Debe escribir un formato de fecha válido. Ej: 12/08/2024"
        );
        return;
      },
    },
    containerCount: {
      message: "¿En cuántos contenedores moverá su carga?",
      user: true,
      function: (params) =>
        handleInputChange("containerCount", params.userInput),
      path: "incoterms",
    },
    incoterms: {
      message: "¿Cuál es la forma de venta (Incoterms)?",
      user: true,
      function: (params) => handleInputChange("incoterms", params.userInput),
      path: "goodsIncluded",
    },
    goodsIncluded: {
      message:
        "¿La mercadería transportada está incluida en estos tipos? a. Computación y celulares; b. Electrónica, TV, audio y video; c. Artículos que contengan cobre.",
      options: ["Sí", "No"],
      function: (params) => {
        handleInputChange("goodsIncluded", params.userInput);
      },
      path: (params) =>
        params.userInput === "No" ? "secGoods" : "invoiceNumber",
    },
    secGoods: {
      message:
        "¿La mercadería transportada está incluida en estos tipos? a. Autopartes, neumáticos, bicicletas, motocicletas, combustibles y lubricantes; b. Textiles, indumentaria, calzado y marroquinería; c. Medicamentos; d. Artículos de perfumería, tocador y cosméticos. Juguetería y bazar. Electrodomésticos; e. Alimentos y bebidas; f. Ferretería, pinturas; g. Cables y metales; h. Nylon, polietileno, polipropileno y poliestireno; i. Scraps de metales.",
      options: ["Sí", "No"],
      function: (params) => {
        handleInputChange("secGoods", params.userInput);
      },
      path: (params) => (params.userInput === "No" ? "merc" : "invoiceNumber"),
    },
    merc: {
      message: "¿Qué tipo de mercadería transporta?",
      user: true,
      function: (params) => handleInputChange("merc", params.userInput),
      path: "invoiceNumber",
    },
    invoiceNumber: {
      message: "Indique el número de factura.",
      user: true,
      function: (params) =>
        handleInputChange("invoiceNumber", params.userInput),
      path: "invoiceFile",
    },
    invoiceFile: {
      message: "Adjunte archivo de factura.",
      file: true,
      chatDisabled: true,
      mimeTypes: [".pdf"],
      function: (fileData) => handleUpload("facturas", fileData),
      path: "summary",
    },
    summary: {
      message:
        "Gracias por completar el formulario. Aquí están los detalles que proporcionó:",
      render: (
        <div>
          <p>Valor mercadería: {form.operationNumber}</p>
          <p>Valor impuestos: {form.consignee}</p>
          <p>Valor transporte: {form.shipper}</p>
          <p>Beneficio imaginario: {form.originCountry}</p>
        </div>
      ),
      options: ["Reiniciar", "Continuar"],
      function: (params) => {
        if (params.userInput === "Reiniciar") {
          return "start"; // Esto reinicia el flujo delchatbot. Si el usuario elige "Finalizar", se podría cerrar la conversación o realizar alguna acción adicional según lo requiera tu implementación.
        }
      },
      path: "gh",
    },
    gh: {
      message: "Guerra o huelga",
      options: ["Sí", "No"],
      function: (params) => handleInputChange("gh", params.userInput === "Sí"),
      chatDisabled: true,
    },
  };
  const options = {
    theme: {
      primaryColor: "#42b0c5",
      secondaryColor: "#491d8d",
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', " +
        "'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', " +
        "sans-serif",
      showHeader: true,
      showFooter: true,
      showInputRow: true,
      // actionDisabledIcon: actionDisabledIcon,
      embedded: false,
      desktopEnabled: true,
      mobileEnabled: true,
    },
    tooltip: {
      mode: "NEVER",
    },
    chatButton: {
      // icon: chatIcon,
    },
    header: {
      title: (
        <h3
          style={{ cursor: "pointer", margin: 0 }}
          onClick={() => window.open("https://github.com/tjtanjin/")}
        >
          SiwBot
        </h3>
      ),
      showAvatar: true,
      avatar: botAvatar,
      // closeChatIcon: closeChatIcon,
    },
    notification: {
      disabled: false,
      defaultToggledOn: true,
      volume: 0.2,
      // icon: notificationIcon,
      // sound: notificationSound,
    },
    audio: {
      disabled: true,
      defaultToggledOn: false,
      language: "en-US",
      voiceNames: [
        "Microsoft David - English (United States)",
        "Alex (English - United States)",
      ],
      rate: 1,
      volume: 1,
      // icon: audioIcon,
    },
    chatHistory: {
      disabled: false,
      maxEntries: 30,
      storageKey: "rcb-history",
      viewChatHistoryButtonText: "Load Chat History ⟳",
      chatHistoryLineBreakText: "----- Previous Chat History -----",
    },
    chatInput: {
      disabled: false,
      enabledPlaceholderText: "Type your message...",
      disabledPlaceholderText: "",
      showCharacterCount: false,
      characterLimit: -1,
      botDelay: 1000,
      // sendButtonIcon: sendButtonIcon,
      blockSpam: true,
      sendOptionOutput: true,
      sendCheckboxOutput: true,
      sendAttachmentOutput: true,
    },
    chatWindow: {
      showScrollbar: false,
      autoJumpToBottom: false,
      showMessagePrompt: true,
      messagePromptText: "Nuevo Mensaje ↓",
      messagePromptOffset: 30,
    },
    userBubble: {
      animate: true,
      showAvatar: false,
      // avatar: userAvatar,
      simStream: false,
      streamSpeed: 30,
    },
    botBubble: {
      animate: true,
      showAvatar: false,
      avatar: botAvatar,
      simStream: false,
      streamSpeed: 30,
    },
    voice: {
      disabled: true,
      defaultToggledOn: false,
      timeoutPeriod: 10000,
      autoSendDisabled: false,
      autoSendPeriod: 1000,
      // icon: voiceIcon,
    },
    footer: {
      text: (
        <div
          style={{ cursor: "pointer" }}
          onClick={() => window.open("https://react-chatbotify.tjtanjin.com")}
        ></div>
      ),
    },
    fileAttachment: {
      disabled: false,
      multiple: true,
      accept: ".png",
      // icon: fileAttachmentIcon,
    },
    emoji: {
      disabled: false,
      // icon: emojiIcon,
      list: [
        "😀",
        "😃",
        "😄",
        "😅",
        "😊",
        "😌",
        "😇",
        "🙃",
        "🤣",
        "😍",
        "🥰",
        "🥳",
        "🎉",
        "🎈",
        "🚀",
        "⭐️",
      ],
    },
    advance: {
      useCustomMessages: false,
      useCustomBotOptions: false,
      useCustomPaths: false,
    },
  };
  const handleInputChange = (stepId, userInput) => {
    setForm((prevData) => ({
      ...prevData,
      [stepId]: userInput,
    }));
  };
  const handleUpload = (params) => {
    const files = params.files;
    console.log(files);
  };

  // Validación isForbidden para Origen y Destino, Fecha de salida,

  return <ChatBot options={options} flow={flow} />;
};

export default ChatForm;
