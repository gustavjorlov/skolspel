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

// Add name mapping to handle discrepancies between GeoJSON data and our country list
const COUNTRY_NAME_MAPPING: Record<string, string> = {
  'Czechia': 'Czech Republic',
  'Bosnia': 'Bosnia and Herzegovina',
  'Bosnia-Herzegovina': 'Bosnia and Herzegovina',
  'Republic of Serbia': 'Serbia',
  'Bosnia and Herz.': 'Bosnia and Herzegovina',
  'Bosnia and Herzegovina': 'Bosnia and Herzegovina',
  'Bosnia & Herzegovina': 'Bosnia and Herzegovina',
  'Bosnia-Herz.': 'Bosnia and Herzegovina',
  'Bosnia Herz.': 'Bosnia and Herzegovina',
  'Bosnia Herz': 'Bosnia and Herzegovina',
  'Bosnia & Herz.': 'Bosnia and Herzegovina',
  'BiH': 'Bosnia and Herzegovina',
  'Serbia': 'Serbia',
  'Serb.': 'Serbia',
  'Rep. Serbia': 'Serbia',
  'Rep. of Serbia': 'Serbia', 
  'Republic of Kosovo': 'Serbia',
  'Kosovo': 'Serbia',
  'Serbia and Montenegro': 'Serbia',
  'Macedonia': 'North Macedonia',
  'FYR Macedonia': 'North Macedonia',
  'Macedonia, FYR': 'North Macedonia',
  'FYROM': 'North Macedonia',
  'Former Yugoslav Republic of Macedonia': 'North Macedonia',
  'Republic of Macedonia': 'North Macedonia',
  'Macedonia (FYROM)': 'North Macedonia',
  // Add more mappings as needed
};

// Reverse mapping for lookup
const REVERSE_COUNTRY_MAPPING: Record<string, string[]> = {};
Object.entries(COUNTRY_NAME_MAPPING).forEach(([geoName, standardName]) => {
  if (!REVERSE_COUNTRY_MAPPING[standardName]) {
    REVERSE_COUNTRY_MAPPING[standardName] = [];
  }
  REVERSE_COUNTRY_MAPPING[standardName].push(geoName);
});

export const filterEuropeanCountries = (
  worldData: FeatureCollection<Geometry, GeoJsonProperties>
): FeatureCollection<Geometry, GeoJsonProperties> => {
  // Log all country names to help debug
  console.log("All country names in GeoJSON:", worldData.features.map(f => f.properties?.name).sort());

  return {
    ...worldData,
    features: worldData.features.filter(feature => {
      // Get the country name from the feature
      const countryName = feature.properties?.name;
      if (!countryName) return false;

      // Check if it's directly in our list
      if (countryName in EUROPEAN_COUNTRIES) return true;

      // Check if it has a mapping to one of our countries
      const mappedName = COUNTRY_NAME_MAPPING[countryName];

      // Log countries that might be Bosnia and Herzegovina or Serbia
      if (countryName.includes("Bos") || countryName.includes("Serb") || countryName.includes("Herz")) {
        console.log(`Found potential match: "${countryName}" → mapped to: "${mappedName || 'not mapped'}"`);
      }

      return mappedName && mappedName in EUROPEAN_COUNTRIES;
    })
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

// Helper function to standardize country names in the game
export const standardizeCountryName = (name: string): string => {
  // If it's already in our standard format, return it
  if (name in EUROPEAN_COUNTRIES) return name;

  // If it's in our mapping, return the standard name
  return COUNTRY_NAME_MAPPING[name] || name;
};

// Helper function to check if two country names refer to the same country
export const isSameCountry = (name1: string, name2: string): boolean => {
  const standardName1 = standardizeCountryName(name1);
  const standardName2 = standardizeCountryName(name2);

  // Direct match
  if (standardName1 === standardName2) return true;

  // Check if name1 is a variant of name2
  if (REVERSE_COUNTRY_MAPPING[standardName2]?.includes(name1)) return true;

  // Check if name2 is a variant of name1
  if (REVERSE_COUNTRY_MAPPING[standardName1]?.includes(name2)) return true;

  return false;
};

const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};