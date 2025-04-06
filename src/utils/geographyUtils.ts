import { Feature, FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

const EUROPEAN_COUNTRIES = new Set([
  'Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina',
  'Bulgaria', 'Croatia', 'Czech Republic', 'Denmark', 'Estonia', 'Finland',
  'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy',
  'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Moldova',
  'Monaco', 'Montenegro', 'Netherlands', 'North Macedonia', 'Norway', 'Poland',
  'Portugal', 'Romania', 'Russia', 'San Marino', 'Serbia', 'Slovakia', 'Slovenia',
  'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom', 'Vatican City'
]);

export const filterEuropeanCountries = (
  worldData: FeatureCollection<Geometry, GeoJsonProperties>
): FeatureCollection<Geometry, GeoJsonProperties> => {
  return {
    ...worldData,
    features: worldData.features.filter(feature => 
      EUROPEAN_COUNTRIES.has(feature.properties?.name || '')
    )
  };
};

export const getRandomOptions = (
  correctCountry: string,
  allCountries: string[],
  numOptions = 4
): string[] => {
  const options = new Set<string>([correctCountry]);
  const availableCountries = allCountries.filter(c => c !== correctCountry);
  
  while (options.size < numOptions && availableCountries.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableCountries.length);
    const country = availableCountries[randomIndex];
    options.add(country);
    availableCountries.splice(randomIndex, 1);
  }

  return shuffleArray(Array.from(options));
};

const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};