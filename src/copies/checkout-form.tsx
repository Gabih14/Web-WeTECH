import React, { useState } from 'react';
import { User, MapPin, Truck, CreditCard, Check, AlertCircle } from 'lucide-react';

const InputField = ({ label, name, type = 'text', required = false, value, onChange, errors, ...props }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
        errors[name] ? 'border-red-500' : 'border-gray-300'
      }`}
      {...props}
    />
    {errors[name] && (
      <p className="text-red-500 text-xs flex items-center gap-1">
        <AlertCircle size={12} />
        {errors[name]}
      </p>
    )}
  </div>
);

const CheckoutForm = () => {
  const [formData, setFormData] = useState({
    // Información personal
    cuit: '',
    nombre: '',
    email: '',
    telefono: '',
    
    // Dirección de entrega
    direccion: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    referencia: '',
    
    // Método de entrega
    metodoEntrega: 'envio', // 'envio' o 'retiro'
    
    // Dirección de facturación
    mismadireccion: true,
    facturacionDireccion: '',
    facturacionCiudad: '',
    facturacionProvincia: '',
    facturacionCodigoPostal: '',
    
    // Campos adicionales
    notasEspeciales: '',
    aceptaTerminos: false,
    recibirNovedades: false
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setCuitLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCuitChange = async (e) => {
    const cuit = e.target.value;
    setFormData(prev => ({ ...prev, cuit }));
    
    // Simular búsqueda de CUIT (aquí irá la integración futura)
    if (cuit.length === 11) {
      setCuitLoading(true);
      // Simulación de llamada a API
      setTimeout(() => {
        setCuitLoading(false);
        // Aquí se autocompletarían los datos
      }, 1000);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validaciones básicas
    if (!formData.cuit || formData.cuit.length !== 11) {
      newErrors.cuit = 'El CUIT debe tener 11 dígitos';
    }
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    }
    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida';
    }
    if (!formData.ciudad.trim()) {
      newErrors.ciudad = 'La ciudad es requerida';
    }
    if (!formData.provincia.trim()) {
      newErrors.provincia = 'La provincia es requerida';
    }
    if (!formData.codigoPostal.trim()) {
      newErrors.codigoPostal = 'El código postal es requerido';
    }
    if (!formData.aceptaTerminos) {
      newErrors.aceptaTerminos = 'Debe aceptar los términos y condiciones';
    }
    
    // Validaciones de facturación si es diferente
    if (!formData.mismadireccion) {
      if (!formData.facturacionDireccion.trim()) {
        newErrors.facturacionDireccion = 'La dirección de facturación es requerida';
      }
      if (!formData.facturacionCiudad.trim()) {
        newErrors.facturacionCiudad = 'La ciudad de facturación es requerida';
      }
      if (!formData.facturacionProvincia.trim()) {
        newErrors.facturacionProvincia = 'La provincia de facturación es requerida';
      }
      if (!formData.facturacionCodigoPostal.trim()) {
        newErrors.facturacionCodigoPostal = 'El código postal de facturación es requerido';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Datos del checkout:', formData);
      alert('¡Checkout completado! Revisa la consola para ver los datos.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Finalizar Compra</h1>
        <p className="text-gray-600">Complete sus datos para proceder con el pedido</p>
      </div>

      <div className="space-y-8">
        {/* Información Personal */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <User className="text-blue-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <InputField
                  label="CUIT"
                  name="cuit"
                  value={formData.cuit}
                  onChange={handleCuitChange}
                  errors={errors}
                  placeholder="20123456789"
                  maxLength="11"
                  required
                />
                {isLoading && (
                  <div className="absolute right-3 top-8">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ingrese su CUIT para autocompletar los datos
              </p>
            </div>
            
            <InputField
              label="Nombre y Apellido"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              errors={errors}
              placeholder="Juan Pérez"
              required
            />
            
            <InputField
              label="Teléfono"
              name="telefono"
              type="tel"
              value={formData.telefono}
              onChange={handleInputChange}
              errors={errors}
              placeholder="+54 9 11 1234-5678"
              required
            />
            
            <div className="md:col-span-2">
              <InputField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                errors={errors}
                placeholder="juan.perez@email.com"
                required
              />
            </div>
          </div>
        </div>

        {/* Método de Entrega */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="text-blue-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">Método de Entrega</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              formData.metodoEntrega === 'envio' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="metodoEntrega"
                value="envio"
                checked={formData.metodoEntrega === 'envio'}
                onChange={handleInputChange}
                className="sr-only"
              />
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  formData.metodoEntrega === 'envio' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {formData.metodoEntrega === 'envio' && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <div>
                  <div className="font-medium">Envío a Domicilio</div>
                  <div className="text-sm text-gray-500">Recíbelo en tu dirección</div>
                </div>
              </div>
            </label>
            
            <label className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              formData.metodoEntrega === 'retiro' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}>
              <input
                type="radio"
                name="metodoEntrega"
                value="retiro"
                checked={formData.metodoEntrega === 'retiro'}
                onChange={handleInputChange}
                className="sr-only"
              />
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  formData.metodoEntrega === 'retiro' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                }`}>
                  {formData.metodoEntrega === 'retiro' && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <div>
                  <div className="font-medium">Retiro en Sucursal</div>
                  <div className="text-sm text-gray-500">Retíralo cuando quieras</div>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Dirección de Envío */}
        {formData.metodoEntrega === 'envio' && (
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-blue-600" size={20} />
              <h2 className="text-xl font-semibold text-gray-900">Dirección de Envío</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <InputField
                  label="Dirección"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  errors={errors}
                  placeholder="Av. Corrientes 1234"
                  required
                />
              </div>
              
              <InputField
                label="Ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                errors={errors}
                placeholder="Buenos Aires"
                required
              />
              
              <InputField
                label="Provincia"
                name="provincia"
                value={formData.provincia}
                onChange={handleInputChange}
                errors={errors}
                placeholder="Buenos Aires"
                required
              />
              
              <InputField
                label="Código Postal"
                name="codigoPostal"
                value={formData.codigoPostal}
                onChange={handleInputChange}
                errors={errors}
                placeholder="1043"
                required
              />
              
              <div className="md:col-span-2">
                <InputField
                  label="Referencias (opcional)"
                  name="referencia"
                  value={formData.referencia}
                  onChange={handleInputChange}
                  errors={errors}
                  placeholder="Piso, departamento, entre calles, etc."
                />
              </div>
            </div>
          </div>
        )}

        {/* Dirección de Facturación */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="text-blue-600" size={20} />
            <h2 className="text-xl font-semibold text-gray-900">Dirección de Facturación</h2>
          </div>
          
          {formData.metodoEntrega === 'envio' && (
            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="mismadireccion"
                  checked={formData.mismadireccion}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Usar la misma dirección de envío para facturación
                </span>
              </label>
            </div>
          )}
          
          {(!formData.mismadireccion || formData.metodoEntrega === 'retiro') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <InputField
                  label="Dirección de Facturación"
                  name="facturacionDireccion"
                  value={formData.facturacionDireccion}
                  onChange={handleInputChange}
                  errors={errors}
                  placeholder="Av. Corrientes 1234"
                  required
                />
              </div>
              
              <InputField
                label="Ciudad"
                name="facturacionCiudad"
                value={formData.facturacionCiudad}
                onChange={handleInputChange}
                errors={errors}
                placeholder="Buenos Aires"
                required
              />
              
              <InputField
                label="Provincia"
                name="facturacionProvincia"
                value={formData.facturacionProvincia}
                onChange={handleInputChange}
                errors={errors}
                placeholder="Buenos Aires"
                required
              />
              
              <InputField
                label="Código Postal"
                name="facturacionCodigoPostal"
                value={formData.facturacionCodigoPostal}
                onChange={handleInputChange}
                errors={errors}
                placeholder="1043"
                required
              />
            </div>
          )}
        </div>

        {/* Información Adicional */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Adicional</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas Especiales (opcional)
              </label>
              <textarea
                name="notasEspeciales"
                value={formData.notasEspeciales}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Instrucciones especiales para la entrega, preferencias, etc."
              ></textarea>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="aceptaTerminos"
                  checked={formData.aceptaTerminos}
                  onChange={handleInputChange}
                  className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5 ${
                    errors.aceptaTerminos ? 'border-red-500' : ''
                  }`}
                />
                <span className="text-sm text-gray-700">
                  Acepto los <a href="#" className="text-blue-600 hover:underline">términos y condiciones</a> 
                  y la <a href="#" className="text-blue-600 hover:underline">política de privacidad</a>
                  <span className="text-red-500 ml-1">*</span>
                </span>
              </label>
              {errors.aceptaTerminos && (
                <p className="text-red-500 text-xs flex items-center gap-1 ml-6">
                  <AlertCircle size={12} />
                  {errors.aceptaTerminos}
                </p>
              )}
              
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="recibirNovedades"
                  checked={formData.recibirNovedades}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                />
                <span className="text-sm text-gray-700">
                  Quiero recibir novedades y ofertas especiales por email
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Botón de Envío */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Check size={20} />
            Finalizar Compra
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;