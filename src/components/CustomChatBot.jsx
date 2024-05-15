import { useState } from "react";
import { ChatBot } from "react-chatbotify";

const CustomChatBot = () => {
  const [customFlow, setCustomFlow] = useState(initialFlow);
  const [customOptions, setCustomOptions] = useState(initialOptions);
  const [currentStep, setCurrentStep] = useState("step1");
  const [form, setForm] = useState({});

  const handleInputChange = (key, value) => {
    setForm(prevForm => ({
      ...prevForm,
      [key]: value
    }));
  };

  const handleUpload = (params) => {
    const files = params.files;
    console.log(files);
  };

  const handleSubmit = () => {
    const nextStep = initialFlow[currentStep].path;
    if (typeof nextStep === 'function') {
      setCurrentStep(nextStep(form));
    } else {
      setCurrentStep(nextStep);
    }
  };

  const renderInputComponent = (inputType, stepKey) => {
    switch (inputType) {
      case 'text':
        return <input type="text" onChange={e => handleInputChange(stepKey, e.target.value)} />;
      case 'date':
        return <input type="date" onChange={e => handleInputChange(stepKey, e.target.value)} />;
      case 'select':
        return (
          <select onChange={e => handleInputChange(stepKey, e.target.value)}>
            {initialFlow[currentStep].options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'autocomplete':
        // Aquí integrarías un componente de autocompletado.
        break;
      // Añade más casos según sea necesario.
      default:
        return <input type="text" onChange={e => handleInputChange(stepKey, e.target.value)} />;
    }
  };

  const steps = {
    step1: {
      message:
        "Bienvenido, este es el asistente de carga de SIW Cargo, ¿Qué tipo de cobertura desea tomar?",
      inputType: "select",
      options: [
        "Multimodal marítimo",
        "Libre avería particular",
        "Terrestre desde puerto",
        "Terrestre",
        "Responsabilidad civil al transportista",
      ],
      function: (params) => handleInputChange("coverageType", params.userInput),
      path: "operationNumber",
    },
    step2: {
      message:
        "Indique un número de operación con el que desee identificar la operación:",
      inputType: "text",
      function: (params) =>
        handleInputChange("operationNumber", params.userInput),
      path: "consignee",
    },
    step3: {
      message: "¿Quién es el consignee según la factura comercial?",
      inputType: "text",
      function: (params) => handleInputChange("consignee", params.userInput),
      path: "shipper",
    },
    step4: {
      message: "¿Y el shipper?",
      inputType: "text",
      function: (params) => handleInputChange("shipper", params.userInput),
      path: "originCountry",
    },
    step5: {
      message: "¿Cuál es el país de origen?",
      inputType: "autocomplete",
      data: ["España", "México", "Argentina"], // Replace this list with the actual list of countries.
      path: async (params) => {
        if (searchCountry(params.userInput)) {
          handleInputChange("originCountry", params.userInput);
          return "originCity";
        }
        await params.injectMessage(
          "No pude entender el país ingresado, podrías escribirlo nuevamente?"
        );
      },
    },
    step6: {
      message: "¿Desde qué ciudad?",
      inputType: "autocomplete",
      data: ["Madrid", "Ciudad de México", "Buenos Aires"], // Replace this list with actual city data fetched dynamically based on the country.
      function: (params) => handleInputChange("originCity", params.userInput),
      path: "destinationCountry",
    },
    step7: {
      message: "¿Cuál es el país de destino?",
      inputType: "autocomplete",
      data: ["España", "México", "Argentina"], // Replace this with the actual list of destination countries.
      function: (params) =>
        handleInputChange("destinationCountry", params.userInput),
      path: "destinationCity",
    },
    step8: {
      message: "¿A qué ciudad?",
      inputType: "autocomplete",
      data: ["Madrid", "Ciudad de México", "Buenos Aires"], // Replace this with actual city data based on the destination country.
      function: (params) =>
        handleInputChange("destinationCity", params.userInput),
      path: "departureDate",
    },
    step9: {
      message: "¿Cuándo saldrá su carga? (DD/MM/AAAA)",
      inputType: "date",
      function: (params) => {
        if (validateDate(params.userInput)) {
          handleInputChange("departureDate", params.userInput);
          return "containerCount";
        }
        params.injectMessage(
          "Debe escribir un formato de fecha válido. Ej: 12/08/2024"
        );
      },
    },
    step10: {
      message: "¿En cuántos contenedores moverá su carga?",
      inputType: "number",
      function: (params) =>
        handleInputChange("containerCount", params.userInput),
      path: "incoterms",
    },
    step11: {
      message: "¿Cuál es la forma de venta (Incoterms)?",
      inputType: "text",
      function: (params) => handleInputChange("incoterms", params.userInput),
      path: "goodsIncluded",
    },
    step12: {
      message:
        "¿La mercadería transportada está incluida en estos tipos? a. Computación y celulares; b. Electrónica, TV, audio y video; c. Artículos que contengan cobre.",
      inputType: "select",
      options: ["Sí", "No"],
      function: (params) =>
        handleInputChange("goodsIncluded", params.userInput),
      path: (params) =>
        params.userInput === "No" ? "secGoods" : "invoiceNumber",
    },
    step13: {
      message: "Indique el número de factura.",
      inputType: "text",
      function: (params) =>
        handleInputChange("invoiceNumber", params.userInput),
      path: "invoiceFile",
    },
    step14: {
      message: "Adjunte archivo de factura.",
      inputType: "file",
      mimeTypes: [".pdf"],
      function: (fileData) => handleUpload("facturas", fileData),
      path: "summary",
    },
    step15: {
      message:
        "Gracias por completar el formulario. Aquí están los detalles que proporcionó:",
      inputType: "summary",
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
          return "start"; // This resets the chatbot flow. If the user chooses "End", additional actions can be taken as needed.
        }
      },
    },
  };

  return <ChatBot flow={flow} options={options} />;
};

export default CustomChatBot;
