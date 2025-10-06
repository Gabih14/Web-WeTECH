import { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";

export const Franquicias = () => {
  // Scroll suave al formulario
  const handleScrollToForm = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const formSection = document.getElementById("formulario-franquicia");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth" });
    }
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

  interface FormEvent extends React.FormEvent<HTMLFormElement> {}

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
      {/* Invitación a leer la nota */}
      <div className="bg-yellow-50 border-b border-yellow-200 py-8">
        <div className="container mx-auto px-4 text-center">
          <a
            href="https://canudas.com.ar/wetech-se-expande-a-todo-el-pais-llega-su-franquicia-de-impresoras-3d/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-lg sm:text-xl font-semibold text-yellow-800 underline hover:text-yellow-600 transition-colors mb-2"
          >
            Leé la nota: WeTECH se expande a todo el país: llega su franquicia de impresoras 3D
          </a>
          <blockquote className="mt-4 text-yellow-900 italic text-lg max-w-2xl mx-auto">
            “Quisiera que hubiera algo como WeTECH en mi provincia”
          </blockquote>
        </div>
      </div>
      {/* Header Section Mejorado */}
      <header className="relative bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-100 text-black py-20 overflow-hidden shadow-md">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-yellow-900 drop-shadow-lg text-center">
            Franquicias <span className="text-yellow-700">WeTECH</span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-medium mb-6 text-yellow-800 text-center max-w-2xl">
            Comenzá tu negocio con nosotros
          </h2>
          <p className="text-lg md:text-xl text-yellow-900 text-center max-w-2xl mb-8">
            Sumate a la red de franquicias tecnológicas líderes en impresión 3D y sé parte de la innovación en tu provincia.
          </p>
          <a
            href="#formulario-franquicia"
            onClick={handleScrollToForm}
            className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-colors text-lg mt-2"
          >
            Quiero más información
          </a>
        </div>
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-yellow-200 rounded-full opacity-30 blur-2xl -z-1 animate-pulse" style={{filter:'blur(32px)'}}></div>
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-yellow-300 rounded-full opacity-20 blur-2xl -z-1 animate-pulse" style={{filter:'blur(40px)'}}></div>
      </header>

      {/* Razones para elegirnos */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-16 text-center text-gray-800">
            Razones para elegirnos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {/* Liderazgo en el mercado */}
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Liderazgo en el mercado</h3>
              <p className="text-gray-600">Somos referentes en tecnología de impresión 3D</p>
            </div>

            {/* Alianzas estratégicas */}
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Alianzas estratégicas</h3>
              <p className="text-gray-600">Red de proveedores y partners tecnológicos</p>
            </div>

            {/* Modelo de negocios probado */}
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Modelo de negocios probado</h3>
              <p className="text-gray-600">Sistema exitoso y rentable comprobado</p>
            </div>

            {/* Alta demanda del producto */}
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Alta demanda del producto</h3>
              <p className="text-gray-600">Mercado en crecimiento constante</p>
            </div>

            {/* Soporte de marketing */}
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Soporte de marketing</h3>
              <p className="text-gray-600">Estrategias promocionales y publicitarias</p>
            </div>

            {/* Formación y capacitación */}
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center mb-8 sm:mb-12">
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <h4 className="text-sm sm:text-base lg:text-lg font-medium text-gray-600 mb-2 sm:mb-3">Inversión inicial</h4>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">$40.000</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <h4 className="text-sm sm:text-base lg:text-lg font-medium text-gray-600 mb-2 sm:mb-3">Royalty</h4>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">7%</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <h4 className="text-sm sm:text-base lg:text-lg font-medium text-gray-600 mb-2 sm:mb-3">Recupero en meses</h4>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">12</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <h4 className="text-sm sm:text-base lg:text-lg font-medium text-gray-600 mb-2 sm:mb-3">Duración del contrato</h4>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">5 años</p>
              </div>
            </div>

            {/* Testimonial */}
            <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8 bg-yellow-50 rounded-xl p-4 sm:p-6 lg:p-8">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white">F</span>
                </div>
              </div>
              <div className="flex-1 text-center lg:text-left">
                <blockquote className="text-lg sm:text-xl text-gray-700 mb-3 sm:mb-4 italic">
                  "Esto es como una juguetería para grandes, hay de todo"
                </blockquote>
                <cite className="text-sm sm:text-base text-gray-600 font-medium">
                  Fernanda, franquiciada WeTECH
                </cite>
              </div>
              
            </div>

            {/* Botones de contacto */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
              <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-colors">
                Folleto digital
              </button>
              <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-colors">
                Entrevista
              </button>
              <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-colors">
                Email
              </button>
              <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-colors">
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
              <img
                src={src}
                alt={`Local WeTECH ${index + 1}`}
                className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-90"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-yellow-900 bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                
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
