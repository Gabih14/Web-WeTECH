import { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import { User as UserIcon } from "lucide-react";

export const Franquicias = () => {
  // Scroll suave al formulario
  const handleScrollToForm = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const formSection = document.getElementById("formulario-franquicia");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Función para abrir WhatsApp
  const openWhatsApp = () => {
    const phoneNumber = "5492615987988";
    const message = "¡Hola! Tengo una consulta sobre las franquicias WeTECH";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  // Función para abrir el folleto PDF
  const openFolleto = () => {
    window.open('/assets/folleto/WeTECH - Folleto Expo Franquicias Mobile.pdf', '_blank');
  };

  const [formData, setFormData] = useState({
    nombre: "",
    celular: "",
    email: "",
    zona: "",
    mensaje: "",
  });

  useEffect(() => {
    // Desplaza la página al inicio al cargar
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prevState: FormData) => ({
      ...prevState,
      [name]: value,
    }));
  };

  interface FormData {
    nombre: string;
    celular: string;
    email: string;
    zona: string;
    mensaje: string;
  }

  interface FormEvent extends React.FormEvent<HTMLFormElement> { }

  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();

    const serviceId = "service_ql4q72a";
    const templateId = "template_yt57d62";
    const templateIdCanudas = "template_8ecs1oj";
    const publicKey = "KtgXJK3IzzROv0Uhs";

    const templateParams = {
      from_name: formData.nombre,
      from_email: formData.email,
      to_name: "WeTECH",
      name: formData.nombre,
      phone: formData.celular,
      zone: formData.zona,
      message: formData.mensaje,
    };
    emailjs
      .send(serviceId, templateIdCanudas, templateParams, publicKey)
      .then(
        (response) => {
          console.log("Email sent successfully:", response);
          setFormData({
            nombre: "",
            celular: "",
            email: "",
            zona: "",
            mensaje: "",
          });
        },
        (error) => {
          console.error("Error sending Canudas email:", error);
        }
      )
      .catch((error) => {
        console.error("Error sending email:", error);
      });
    // Send the email using EmailJS
    emailjs
      .send(serviceId, templateId, templateParams, publicKey)
      .then(
        (response) => {
          console.log("Email sent successfully:", response);
          setFormData({
            nombre: "",
            celular: "",
            email: "",
            zona: "",
            mensaje: "",
          });
          alert(
            "¡Gracias por tu interés! Nos comunicaremos contigo a la brevedad."
          );
        },
        (error) => {
          console.error("Error sending email:", error);
          alert(
            "Ocurrió un error al enviar tu consulta. Por favor, intenta nuevamente."
          );
        }
      )
      .catch((error) => {
        console.error("Error sending email:", error);
      });
  };

  const galleryImages = Array.from(
    { length: 6 },
    (_, i) => `/assets/local${i + 1}.webp`
  );
  return (
    <div className="bg-white">

      {/* Header Section Mejorado */}
  <header className="relative bg-gradient-to-br from-black via-gray-800 to-gray-700 text-white py-10 md:py-14 overflow-hidden shadow-md">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center relative z-10">
          <img
            src="/assets/franquicias/wetech-franquicias-logo.webp"
            alt="Logo Franquicias WeTECH"
            className="mx-auto mb-4 w-64 md:w-80 lg:w-96 h-auto"
          />

        </div>
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-yellow-200 rounded-full opacity-30 blur-2xl -z-1 animate-pulse" style={{ filter: 'blur(32px)' }}></div>
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-yellow-300 rounded-full opacity-20 blur-2xl -z-1 animate-pulse" style={{ filter: 'blur(40px)' }}></div>
      </header>

      {/* Razones para elegirnos */}
      <section className="bg-gray-50 py-10">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-16 text-center text-gray-800">
            Razones para elegirnos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {/* Liderazgo en el mercado */}
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <img
                  src="/assets/franquicias/iconos folleto expo franquicias-01.svg"
                  alt="Liderazgo en el mercado"
                  className="w-16 h-16"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Liderazgo en el mercado</h3>
              <p className="text-gray-600">Somos referentes en tecnología de impresión 3D</p>
            </div>

            {/* Alianzas estratégicas */}
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <img
                  src="/assets/franquicias/iconos folleto expo franquicias-02.svg"
                  alt="Alianzas estratégicas"
                  className="w-16 h-16"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Alianzas estratégicas</h3>
              <p className="text-gray-600">Red de proveedores y partners tecnológicos</p>
            </div>

            {/* Modelo de negocios probado */}
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <img
                  src="/assets/franquicias/iconos folleto expo franquicias-03.svg"
                  alt="Modelo de negocios probado"
                  className="w-16 h-16"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Modelo de negocios probado</h3>
              <p className="text-gray-600">Sistema exitoso y rentable comprobado</p>
            </div>

            {/* Alta demanda del producto */}
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <img
                  src="/assets/franquicias/iconos folleto expo franquicias-04.svg"
                  alt="Alta demanda del producto"
                  className="w-16 h-16"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Alta demanda del producto</h3>
              <p className="text-gray-600">Mercado en crecimiento constante</p>
            </div>

            {/* Soporte de marketing */}
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <img
                  src="/assets/franquicias/iconos folleto expo franquicias-05.svg"
                  alt="Soporte de marketing"
                  className="w-16 h-16"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Soporte de marketing</h3>
              <p className="text-gray-600">Estrategias promocionales y publicitarias</p>
            </div>

            {/* Formación y capacitación */}
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <img
                  src="/assets/franquicias/iconos folleto expo franquicias-06.svg"
                  alt="Liderazgo en el mercado"
                  className="w-16 h-16"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Formación y capacitación</h3>
              <p className="text-gray-600">Entrenamiento completo y apoyo continuo</p>
            </div>
          </div>

          {/* Datos clave */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8">
            <h3 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-center text-gray-800">
              Datos clave
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-center mb-8 sm:mb-12">
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <h4 className="text-sm sm:text-base lg:text-lg font-medium text-gray-600 mb-2 sm:mb-3">INVERSIÓN TOTAL</h4>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">$39.000 USD</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <h4 className="text-sm sm:text-base lg:text-lg font-medium text-gray-600 mb-2 sm:mb-3">STOCK INICIAL</h4>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">$19.000 USD</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <h4 className="text-sm sm:text-base lg:text-lg font-medium text-gray-600 mb-2 sm:mb-3">FEE DE INGRESO</h4>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">$10.000 USD</p>
              </div>
            </div>

            {/* Testimonial placeholder */}
            <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8 bg-yellow-50 rounded-xl p-4 sm:p-6 lg:p-8">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-yellow-400 rounded-full flex items-center justify-center">
                  <UserIcon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center lg:text-left">
                <blockquote className="text-2xl sm:text-3xl lg:text-4xl text-gray-900 italic">
                  Acá podés estar vos!
                </blockquote>
              </div>
            </div>

            {/* Botones de contacto */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
              <a
                href="#formulario-franquicia"
                onClick={handleScrollToForm}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-colors"
              >
                Formulario
              </a>
              <button
                onClick={openFolleto}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-colors"
              >
                Folleto digital
              </button>
              <a
                href="https://canudas.com.ar/wetech-se-expande-a-todo-el-pais-llega-su-franquicia-de-impresoras-3d/"
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-colors">
                Nota con Canudas
              </a>
              <a
                href="mailto:franquicias@wetech.ar?subject=Consulta sobre Franquicias WeTECH&body=Hola, me interesa conocer más sobre las franquicias WeTECH. Me gustaría recibir más información."
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-colors inline-block text-center"
              >
                Email
              </a>
              <button
                onClick={openWhatsApp}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-colors"
              >
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section Mejorada */}
      <section className="container mx-auto px-4 py-20">
        {/* <h2 className="text-4xl font-extrabold mb-10 text-center text-yellow-800 tracking-tight drop-shadow-lg">
          Galería de Locales WeTECH
        </h2>
        <p className="text-lg text-yellow-900 text-center max-w-2xl mx-auto mb-8">
          Descubrí cómo lucen nuestras franquicias en diferentes puntos del país. Espacios modernos, tecnológicos y pensados para inspirar.
        </p> */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {galleryImages.map((src, index) => (
            <div
              key={index}
              className="relative group rounded-2xl shadow-lg overflow-hidden border border-yellow-100 bg-white"
            >
              {/* Blur placeholder */}
              <div className="absolute inset-0 bg-yellow-200 blur-xl scale-105 z-0"></div>
              <img
                src={src}
                alt={`Local WeTECH ${index + 1}`}
                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-90 relative z-10"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-yellow-900 bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center z-20">
                {/* Puedes agregar overlay o ícono aquí si quieres */}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Form Section */}
      <div className="bg-yellow-100 py-16" id="formulario-franquicia">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-yellow-800">
            ¿Interesado en nuestra franquicia?
          </h2>
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="nombre"
                  className="block text-yellow-700 font-medium mb-2"
                >
                  Nombre completo:
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="celular"
                  className="block text-yellow-700 font-medium mb-2"
                >
                  Celular:
                </label>
                <input
                  type="tel"
                  id="celular"
                  name="celular"
                  value={formData.celular}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-yellow-700 font-medium mb-2"
                >
                  Mail:
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="zona"
                  className="block text-yellow-700 font-medium mb-2"
                >
                  Zona de interés:
                </label>
                <input
                  type="text"
                  id="zona"
                  name="zona"
                  value={formData.zona}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600"
                  required
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="mensaje"
                  className="block text-yellow-700 font-medium mb-2"
                >
                  Mensaje:
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600 h-32"
                  required
                ></textarea>
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-yellow-500 text-white px-6 py-3 rounded-md font-medium hover:bg-yellow-700 transition-colors"
                >
                  Enviar consulta
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
