import { useEffect, useState } from "react";
import ChatBot from "react-chatbotify";
import { validateDate } from "./validations";
import botAvatar from "../assets/siwcargo.png";
import logo from "../assets/logo.png";
import {
  allCountries,
  forbiddenCountries,
  getCitiesByCountry,
  getCountryCode,
  searchCountry,
} from "./countries";

const ChatForm = () => {
  const [form, setForm] = useState({});
  const [locationOptions, setLocationOptions] = useState([]);
  const [nextStep, setNextStep] = useState(6);
  const [currentStep, setCurrentStep] = useState(1);

  const allowedCountryCodes = Object.keys(allCountries).filter(
    (code) => !Object.hasOwnProperty.call(forbiddenCountries, code)
  );
  const username = "txakur";
  getCitiesByCountry(allowedCountryCodes, username);

  async function validateCountryInput(params, inputStep, nextPath) {
    const countryCode = getCountryCode(params.userInput);
    if (Number(params.userInput)) {
      await params.injectMessage("Un país no puede ser un número.");
      return;
    }
    if (countryCode && forbiddenCountries[countryCode]) {
      await params.injectMessage(
        "Servicios no disponibles para el país seleccionado. Por favor, elige otro destino u origen."
      );
      return;
    }
    if (searchCountry(params.userInput) === 0) {
      await params.injectMessage("El país no existe.");
      return;
    }
    if (searchCountry(params.userInput) === 1) {
      handleInputChange(inputStep, params.userInput);
      return nextPath;
    } else {
      const locations = searchCountry(params.userInput);
      setLocationOptions(
        typeof locations === "string" ? [locations] : locations
      );
      setNextStep(nextPath);
      return "19";
    }
  }

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
      function: (params) => handleInputChange(1, params.userInput),
      path: "2",
    },
    2: {
      message:
        "Indique un número de operación con el que desee identificar la operación:",
      user: true,
      function: (params) => handleInputChange(2, params.userInput),
      path: "3",
    },
    3: {
      message: "¿Quién es el consignee según la factura comercial?",
      user: true,
      function: (params) => handleInputChange(3, params.userInput),
      path: "4",
    },
    4: {
      message: "¿Y el shipper?",
      user: true,
      function: (params) => handleInputChange(4, params.userInput),
      path: "5",
    },
    5: {
      message: "¿Cuál es el país de origen?",
      user: true,
      path: async (params) => await validateCountryInput(params, 5, "6"),
    },
    6: {
      message: "¿Desde qué ciudad?",
      // consultar si la ciudad existe
      user: true,
      function: (params) => handleInputChange(6, params.userInput),
      path: "7",
    },
    7: {
      message: "¿Cuál es el país de destino?",
      user: true,
      function: (params) => handleInputChange(7, params.userInput),
      path: async (params) => await validateCountryInput(params, 7, "8"),
    },
    8: {
      message: "¿A qué ciudad?",
      user: true,
      function: (params) => handleInputChange(8, params.userInput),
      path: "9",
    },
    9: {
      message: "¿Cuándo saldrá su carga? (DD/MM/AAAA)",
      user: true,
      function: (params) => handleInputChange(9, params.userInput),
      path: async (params) => {
        const userInputDate = new Date(
          params.userInput.split("/").reverse().join("-") + "T00:00:00"
        );
        const today = new Date(new Date().toDateString());

        if (!validateDate(params.userInput)) {
          const date = new Date();
          await params.injectMessage(
            `Debe escribir un formato de fecha válido. Ej: ${date.toLocaleDateString()}`
          );
          return;
        } else if (userInputDate < today) {
          await params.injectMessage(
            "La fecha de envío no puede ser anterior a hoy."
          );
          return;
        } else {
          return "10";
        }
      },
    },
    10: {
      message: "¿En cuántos contenedores moverá su carga?",
      user: true,
      function: (params) => handleInputChange(10, params.userInput),
      path: async (params) => {
        if (typeof parseInt(params.userInput) !== "number") {
          await params.injectMessage("Debe escribir un número.");
          return;
        } else {
          return "11";
        }
      },
    },
    11: {
      message: "¿Cuál es la forma de venta (Incoterms)?",
      user: true,
      function: (params) => handleInputChange(11, params.userInput),
      path: "12",
    },
    12: {
      message:
        "¿La mercadería transportada está incluida en estos tipos? a. Computación y celulares; b. Electrónica, TV, audio y video; c. Artículos que contengan cobre.",
      options: ["Sí", "No"],
      function: (params) => {
        handleInputChange(12, params.userInput);
      },
      path: (params) => (params.userInput === "No" ? "13" : "15"),
    },
    13: {
      message:
        "¿La mercadería transportada está incluida en estos tipos? a. Autopartes, neumáticos, bicicletas, motocicletas, combustibles y lubricantes; b. Textiles, indumentaria, calzado y marroquinería; c. Medicamentos; d. Artículos de perfumería, tocador y cosméticos. Juguetería y bazar. Electrodomésticos; e. Alimentos y bebidas; f. Ferretería, pinturas; g. Cables y metales; h. Nylon, polietileno, polipropileno y poliestireno; i. Scraps de metales.",
      options: ["Sí", "No"],
      function: (params) => {
        handleInputChange(13, params.userInput);
      },
      path: (params) => (params.userInput === "No" ? "14" : "15"),
    },
    14: {
      message: "¿Qué tipo de mercadería transporta?",
      user: true,
      function: (params) => handleInputChange(14, params.userInput),
      path: "15",
    },
    15: {
      message: "Indique el número de factura.",
      user: true,
      function: (params) => handleInputChange(15, params.userInput),
      path: "16",
    },
    16: {
      message: "Adjunte archivo de factura.",
      chatDisabled: true,
      file: (params) => handleUpload(params),
      path: "17",
    },
    17: {
      message:
        "Gracias por completar el formulario. Aquí están los detalles que proporcionó:",
      render: (
        <div style={{padding: "3px"}}>
          <p>Valor mercadería: {form.operationNumber}</p>
          <p>Valor impuestos: {form.consignee}</p>
          <p>Valor transporte: {form.shipper}</p>
          <p>Beneficio imaginario: {form.originCountry}</p>
        </div>
      ),
      options: ["Reiniciar", "Continuar"],
      function: (params) => {
        if (params.userInput === "Reiniciar") {
          return "1";
        }
      },
      path: "18",
    },
    18: {
      message: "Guerra o huelga",
      options: ["Sí", "No"],
      function: (params) => handleInputChange(18, params.userInput === "Sí"),
      chatDisabled: true,
      end: true,
    },
    19: {
      message: "Quizás quisiste decir:",
      options: locationOptions,
      function: (params) => handleInputChange(nextStep - 1, params.userInput),
      path: async (params) =>
        await validateCountryInput(params, currentStep, nextStep.toString()),
    },
    20: {
      message:
        "Servicios no disponibles para el país seleccionado. Por favor, elige otro destino u origen.",
    },
  };

  const options = {
    theme: {
      primaryColor: "#29a9d3",
      secondaryColor: "#003366",
    },
    header: {
      title: <h3 style={{ cursor: "pointer", margin: 0 }}>SiwBot</h3>,
      showAvatar: false,
      avatar: logo,
    },
    tooltip: {
      mode: "NEVER",
    },
    notification: {
      disabled: false,
      defaultToggledOn: true,
      volume: 0.2,
    },
    chatButton: {
      icon: logo,
    },
    chatHistory: {
      disabled: true,
      maxEntries: 30,
      storageKey: "rcb-history",
      viewChatHistoryButtonText: "Cargar historial ⟳",
      chatHistoryLineBreakText: "----- Chat Previo -----",
    },
    chatInput: {
      disabled: false,
      enabledPlaceholderText: "Escriba aquí su mensaje...",
      disabledPlaceholderText: "",
      showCharacterCount: false,
      characterLimit: -1,
      botDelay: 1000,
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
    footer: { text: "" },
    emoji: { disabled: true },
    fileAttachment: {
      disabled: false, // especificar paso ?
      multiple: true,
      accept: ".pdf",
    },
  };

  const handleInputChange = (stepId, userInput) => {
    setCurrentStep(stepId + 1);
    setForm((prevData) => ({
      ...prevData,
      [stepId]: userInput,
    }));
  };
  const handleUpload = (params) => {
    const files = params.files;
    console.log(params);
  };

  return <ChatBot options={options} flow={flow} />;
};

export default ChatForm;
