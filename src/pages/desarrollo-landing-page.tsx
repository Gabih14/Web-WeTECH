import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Calendar,
  Instagram,
  Facebook,
} from "lucide-react";

export function DevelopmentLandingPage() {

  

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-yellow-100 flex flex-col">
      {/* Header */}

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-yellow-800 mb-6">
            Próximamente
          </h1>
          <div className="w-24 h-1 bg-yellow-500 mx-auto mb-8"></div>
          <h2 className="text-2xl md:text-3xl font-medium text-gray-700 mb-8">
            Estamos trabajando en algo especial para ti
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Nuestro sitio web está en desarrollo. Mientras tanto, puedes
            contactarnos o visitar nuestro local.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a
              href="#contacto"
              className="px-8 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition shadow-lg"
            >
              Contáctanos
            </a>
            <a
              href="#ubicacion"
              className="px-8 py-3 bg-white text-yellow-600 border border-yellow-600 rounded-lg hover:bg-yellow-50 transition shadow-lg"
            >
              Visítanos
            </a>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section id="info" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-yellow-800 mb-12">
            Información
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-yellow-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="bg-yellow-100 p-4 rounded-full mb-4">
                <Clock size={32} className="text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Horario de Atención
              </h3>
              <p className="text-gray-600">
                Lunes a Viernes: <span className="font-bold">10:00 - 19:00</span>
                <br />
                Sábados: <span className="font-bold">10:00 - 14:00</span>
                <br />
                Domingos: Cerrado
              </p>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="bg-yellow-100 p-4 rounded-full mb-4">
                <Calendar size={32} className="text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lanzamiento</h3>
              <p className="text-gray-600">
                Estamos trabajando arduamente para lanzar nuestro sitio web
                completo
                <br />
                Fecha estimada: Mayo
              </p>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <div className="bg-yellow-100 p-4 rounded-full mb-4">
                <MapPin size={32} className="text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Dirección</h3>
              <p className="text-gray-600">Santiago de Liniers 670</p>
                  <p className="text-gray-600">Godoy Cruz, Mendoza</p>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="ubicacion" className="py-16">
              <div className="text-center p-6">
                
                <h2 className="text-3xl font-bold text-center text-yellow-800 mb-12">
                  Encuéntranos aquí
                </h2>
                
              </div>
            
        <div className="container mx-auto px-4">
        
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            

            
            {/* Map Section */}
            <div className="h-[300px] md:h-[400px] relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3349.775013218909!2d-68.8513437!3d-32.9041163!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x967e093c4c366269%3A0x6b020d0373986c7!2sMDZ%203D%20STORE%20-%20Venta%20Impresoras%203D%20y%20Filamentos%20en%20Mendoza!5e0!3m2!1ses-419!2sar!4v1739820370024!5m2!1ses-419!2sar"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de la tienda"
              ></iframe>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <a
                  href="https://maps.app.goo.gl/NbjkqZgv72pkWcTR8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-700 transition"
                >
                  Ver en Google Maps
                </a>
              </div>
            </div>
            <div className="p-6 bg-blue-50">
              <p className="text-gray-600">Santiago de Liniers 670</p>
              <p className="text-gray-600">Godoy Cruz, Mendoza</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="bg-yellow-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Contacto</h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-semibold mb-6">
                Información de Contacto
              </h3>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-yellow-500 p-3 rounded-full mr-4">
                    <Phone size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-xl">Teléfono / WhatsApp</h4>
                    <p className="text-yellow-100">+54 9 261 598 7988</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-yellow-500 p-3 rounded-full mr-4">
                    <Mail size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-xl">Email</h4>
                    <p className="text-yellow-100">info@mdz3d.ar</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-yellow-500 p-3 rounded-full mr-4">
                    <MapPin size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-xl">Dirección</h4>
                    <p className="text-white-600">Santiago de Liniers 670</p>
              <p className="text-white-600">Godoy Cruz, Mendoza</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-medium text-xl mb-4">Síguenos</h4>
                <div className="flex space-x-4">
                  <a
                    href="https://www.facebook.com/MDZ3DSTORE"
                    className="bg-yellow-500 p-3 rounded-full hover:bg-yellow-400 transition"
                  >
                    <Facebook size={20} className="text-white" />
                  </a>
                  <a
                    href="https://www.instagram.com/mdz3d/"
                    className="bg-yellow-500 p-3 rounded-full hover:bg-yellow-400 transition"
                  >
                    <Instagram size={20} className="text-white" />
                  </a>
                  
                </div>
              </div>
            </div>

            <div>
              <div className="mt-8 bg-yellow-700 p-5 rounded-lg">
                <h4 className="font-medium text-lg mb-2">Nota</h4>
                <p className="text-yellow-100 text-sm">
                  Puedes seguir comprando por nuestra anterior web en www.mdz3d.ar
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
