import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

const EUROPEAN_COUNTRIES: Record<string, string> = {
  'Albania': 'Albanien',
  'Andorra': 'Andorra',
  'Austria': 'Österrike',
  'Belarus': 'Vitryssland',
  'Belgium': 'Belgien',
  'Bosnia and Herzegovina': 'Bosnien och Hercegovina',
  'Bulgaria': 'Bulgarien',
  'Croatia': 'Kroatien',
  'Czech Republic': 'Tjeckien',
  'Denmark': 'Danmark',
  'Estonia': 'Estland',
  'Finland': 'Finland',
  'France': 'Frankrike',
  'Germany': 'Tyskland',
  'Greece': 'Grekland',
  'Hungary': 'Ungern',
  'Iceland': 'Island',
  'Ireland': 'Irland',
  'Italy': 'Italien',
  'Latvia': 'Lettland',
  'Liechtenstein': 'Liechtenstein',
  'Lithuania': 'Litauen',
  'Luxembourg': 'Luxemburg',
  'Malta': 'Malta',
  'Moldova': 'Moldavien',
  'Monaco': 'Monaco',
  'Montenegro': 'Montenegro',
  'Netherlands': 'Nederländerna',
  'North Macedonia': 'Nordmakedonien',
  'Norway': 'Norge',
  'Poland': 'Polen',
  'Portugal': 'Portugal',
  'Romania': 'Rumänien',
  'Russia': 'Ryssland',
  'San Marino': 'San Marino',
  'Serbia': 'Serbien',
  'Slovakia': 'Slovakien',
  'Slovenia': 'Slovenien',
  'Spain': 'Spanien',
  'Sweden': 'Sverige',
  'Switzerland': 'Schweiz',
  'Ukraine': 'Ukraina',
  'United Kingdom': 'Storbritannien',
  'Vatican City': 'Vatikanstaten'
};

export const filterEuropeanCountries = (
  worldData: FeatureCollection<Geometry, GeoJsonProperties>
): FeatureCollection<Geometry, GeoJsonProperties> => {
  return {
    ...worldData,
    features: worldData.features.filter(feature => 
      feature.properties?.name && feature.properties.name in EUROPEAN_COUNTRIES
    )
  };
};

export const getRandomOptions = (
  correctCountry: string,
  allCountries: string[],
  numOptions = 4
): { en: string; sv: string }[] => {
  const options = new Set<string>([correctCountry]);
  const availableCountries = allCountries.filter(c => c !== correctCountry);
  
  while (options.size < numOptions && availableCountries.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableCountries.length);
    const country = availableCountries[randomIndex];
    options.add(country);
    availableCountries.splice(randomIndex, 1);
  }

  return shuffleArray(Array.from(options)).map(country => ({
    en: country,
    sv: EUROPEAN_COUNTRIES[country]
  }));
};

const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};