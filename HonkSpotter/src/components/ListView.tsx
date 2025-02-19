import useGooseLocationStore from '../store/useGooseLocationStore';

const ListView = () => {
  const { gooseLocations } = useGooseLocationStore();

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Goose Locations</h2>
      <ul>
        {gooseLocations.map((location, index) => (
          <li key={index} className="mb-5 border-b border-gray-300 pb-2">
            <h3 className="text-xl font-semibold">{location.title}</h3>
            <p>{location.description}</p>
            <p className="text-sm text-gray-600">
              Coordinates: {location.coordinate.lat}, {location.coordinate.lng}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
};

export default ListView;
