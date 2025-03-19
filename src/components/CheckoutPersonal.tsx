type Props = {
    formData: {
      name: string;
      email: string;
      phone: string;
    };
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };


export const CheckoutPersonal = ({formData, handleInputChange}: Props) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md"><h2 className="text-lg font-medium text-gray-900 mb-4">
    Información Personal
  </h2>
  <div className="grid grid-cols-1 gap-4">
    <div>
      <label
        htmlFor="name"
        className="block text-sm font-medium text-gray-700"
      >
        Nombre completo
      </label>
      <input
        type="text"
        id="name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        required
        className="mt-1 block w-full rounded-md border-2 border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
    <div>
      <label
        htmlFor="email"
        className="block text-sm font-medium text-gray-700"
      >
        Email
      </label>
      <input
        type="email"
        id="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        required
        className="mt-1 block w-full rounded-md border-2 border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
    <div>
      <label
        htmlFor="phone"
        className="block text-sm font-medium text-gray-700"
      >
        Teléfono
      </label>
      <input
        type="tel"
        id="phone"
        name="phone"
        value={formData.phone}
        onChange={handleInputChange}
        required
        className="mt-1 block w-full rounded-md border-2 border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
  </div></div>
  )
}
