import { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";

export const Franquicias = () => {
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
            Comenzá un negocio que va a cambiar el mundo
          </h2>
          <p className="text-lg md:text-xl text-yellow-900 text-center max-w-2xl mb-8">
            Sumate a la red de franquicias tecnológicas líderes en impresión 3D y sé parte de la innovación en tu provincia.
          </p>
        {/*   <a
            href="#formulario-franquicia"
            className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-colors text-lg mt-2"
          >
            Quiero más información
          </a> */}
        </div>
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-yellow-200 rounded-full opacity-30 blur-2xl -z-1 animate-pulse" style={{filter:'blur(32px)'}}></div>
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-yellow-300 rounded-full opacity-20 blur-2xl -z-1 animate-pulse" style={{filter:'blur(40px)'}}></div>
      </header>

      {/* Reasons to Choose Us Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center text-yellow-800">
          Razones para elegirnos
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-yellow-100 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">
              1. Liderazgo en el mercado
            </h3>
            <p>Somos líderes en el mercado tecnológico de impresión 3D.</p>
          </div>
          <div className="bg-yellow-100 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">
              2. Alianzas estratégicas
            </h3>
            <p>
              Contamos con alianzas estratégicas para lograr acuerdos de
              economía de escala y brindar los precios más competitivos.
              Altamente rentable por sus margenes.
            </p>
          </div>
          <div className="bg-yellow-100 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">
              3. Conocimiento del mercado
            </h3>
            <p>Amplio conocimiento del mercado y del consumidor.</p>
          </div>
          <div className="bg-yellow-100 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">4. Negocio probado</h3>
            <p>Wetech es un negocio probado, tecnológico y disruptivo.</p>
          </div>
          <div className="bg-yellow-100 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">
              5. Servicio técnico oficial
            </h3>
            <p>
              Brindamos servicio técnico oficial y garantía directa de fábrica,
              lo que genera confianza en nuestros consumidores.
            </p>
          </div>
          <div className="bg-yellow-100 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">
              6. Fidelización de clientes
            </h3>
            <p>
              Logramos una fidelización con nuestros clientes a través del
              conocimiento, el apoyo y el acompañamiento constante.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-yellow-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center text-yellow-800">
            Beneficios de elegirnos: La fórmula perfecta para emprender sin
            complicaciones
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="bg-yellow-500 text-white w-12 h-12 rounded-full flex items-center justify-center mb-4 text-xl font-bold">
                1
              </div>
              <p>
                Armado de los locales, acompañamiento y supervisión del mismo.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="bg-yellow-500 text-white w-12 h-12 rounded-full flex items-center justify-center mb-4 text-xl font-bold">
                2
              </div>
              <p>Exclusividad de la zona delimitada por contrato.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="bg-yellow-500 text-white w-12 h-12 rounded-full flex items-center justify-center mb-4 text-xl font-bold">
                3
              </div>
              <p>
                Sistema de gestión único que permitirá la organización completa
                del negocio.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="bg-yellow-500 text-white w-12 h-12 rounded-full flex items-center justify-center mb-4 text-xl font-bold">
                4
              </div>
              <p>
                Capacitaciones constantes para el equipo, acompañadas de
                manuales operativos que estandarizan tu gestión.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="bg-yellow-500 text-white w-12 h-12 rounded-full flex items-center justify-center mb-4 text-xl font-bold">
                5
              </div>
              <p>Una inversión sólida y accesible.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="bg-yellow-500 text-white w-12 h-12 rounded-full flex items-center justify-center mb-4 text-xl font-bold">
                6
              </div>
              <p>
                Evolución constante en productos novedosos para nuestro rubro.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center text-yellow-800">
          Galería
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((src, index) => (
            <div key={index} className="overflow-hidden rounded-lg shadow">
              <img
                src={src}
                alt={`WeTECH Gallery ${index + 1}`}
                className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="bg-yellow-100 py-16">
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
