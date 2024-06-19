import { useState } from "react";
import ChatBot from "react-chatbotify";
import { validateDate } from "./validations";
import botAvatar from "../assets/siwcargo.png";
import logo from "../assets/logo.png";
import {
  allCountries,
  forbiddenCountries,
  getCountryCode,
  searchCountry,
} from "./countries";

const ChatForm = () => {
  const [form, setForm] = useState({});
  const [locationOptions, setLocationOptions] = useState([]);
  const [nextStep, setNextStep] = useState(6);
  const [currentCountry, setCurrentCountry] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [warning, setWarning] = useState({});

  const allowedCountryCodes = Object.keys(allCountries).filter(
    (code) => !Object.hasOwnProperty.call(forbiddenCountries, code)
  );

  async function validateCountryInput(params, inputStep, nextPath) {
    const countryCode = getCountryCode(params.userInput);
    if (Number(params.userInput)) {
      await params.injectMessage("Un país no puede ser un número.");
      return;
    }
    if (countryCode && forbiddenCountries[countryCode]) {
      setWarning((prevState) => ({
        ...prevState,
        currentStep: forbiddenCountries[countryCode],
      }));
    }
    if (searchCountry(params.userInput) === 0) {
      console.log(params.userInput);
      await params.injectMessage("El país no existe.");
      return;
    }
    if (searchCountry(params.userInput) === 1) {
      handleInputChange(inputStep, params.userInput);
      setCurrentCountry(params.userInput);
      setCurrentStep(nextPath);
      return nextPath;
    } else {
      const locations = searchCountry(params.userInput);
      setLocationOptions(
        typeof locations === "string" ? [locations] : locations
      );
      setNextStep(nextPath);
      return "22";
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
      path: (params) => {
        if (params.userInput === "No") {
          return "13";
        } else {
          setWarning((prevState) => ({ ...prevState, merchType: 1 }));
          return "15";
        }
      },
    },
    13: {
      message:
        "¿La mercadería transportada está incluida en estos tipos? a. Autopartes, neumáticos, bicicletas, motocicletas, combustibles y lubricantes; b. Textiles, indumentaria, calzado y marroquinería; c. Medicamentos; d. Artículos de perfumería, tocador y cosméticos. Juguetería y bazar. Electrodomésticos; e. Alimentos y bebidas; f. Ferretería, pinturas; g. Cables y metales; h. Nylon, polietileno, polipropileno y poliestireno; i. Scraps de metales.",
      options: ["Sí", "No"],
      function: (params) => {
        handleInputChange(13, params.userInput);
      },
      path: (params) => {
        if (params.userInput === "No") {
          return "14";
        } else {
          setWarning((prevState) => ({ ...prevState, merchType: 2 }));
          return "15";
        }
      },
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
      message: "Ingrese el valor de la mercadería asegurada en USD:",
      // valor numérico
      user: true,
      function: (params) => handleInputChange(17, params.userInput),
      path: (params) =>
        Number(params.userInput)
          ? "18"
          : params.injectMessage("Ingrese un valor numérico"),
    },
    18: {
      message: "Ingrese el valor de impuestos:",
      // valor numérico

      user: true,
      function: (params) => handleInputChange(18, params.userInput),
      path: (params) =>
        Number(params.userInput)
          ? "19"
          : params.injectMessage("Ingrese un valor numérico"),
    },
    19: {
      message: "Ingrese el valor del transporte:",
      // valor numérico
      user: true,
      function: (params) => handleInputChange(19, params.userInput),
      path: (params) =>
        Number(params.userInput)
          ? "20"
          : params.injectMessage("Ingrese un valor numérico"),
    },
    20: {
      message: "Ingrese el valor del beneficio imaginario:",
      // preguntar valor beneficio imaginario
      user: false,
      options: ["10", "15", "20"],
      function: (params) => handleInputChange(20, params.userInput),
      path: "21",
    },
    21: {
      message: "Guerra o huelga",
      // perguntar valor guerra o huelga
      options: ["Sí", "No"],
      function: (params) => {
        handleInputChange(21, params.userInput === "Sí");
        console.log(Object.values(warning), typeof Object.values(warning));
      },
      chatDisabled: true,
      end: true,
    },
    22: {
      message: "Quizás quisiste decir:",
      options: locationOptions,
      function: (params) => handleInputChange(currentStep, params.userInput),
      path: async (params) =>
        await validateCountryInput(params, currentStep, nextStep.toString()),
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
