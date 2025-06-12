import { MapPin, Mail, Clock } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

export const ContactInfo = () => {
  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Contact Information */}
          <div className="p-8 bg-gray-50">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Dirección</p>
                  <p className="text-gray-600">Santiago de Liniers 670</p>
                  <p className="text-gray-600">Godoy Cruz, Mendoza</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">
                    Horario de atención
                  </p>
                  <p className="text-gray-600">
                    Lunes a Viernes:{" "}
                    <span className="font-bold">10:00 - 19:00</span>
                  </p>
                  <p className="text-gray-600">
                    Sábados: <span className="font-bold">10:00 - 14:00</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <SiWhatsapp className="w-5 h-5 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Teléfono</p>
                  <p className="text-gray-600">+54 9 261 598 7988</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 mt-1" />
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <p className="text-gray-600">fp@mdz3d.ar</p>
                </div>
              </div>
            </div>
          </div>

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
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-700 transition"
              >
                Ver en Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
