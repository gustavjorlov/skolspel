import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { geoPath, geoMercator } from "d3-geo";

const SMALL_COUNTRIES = [
  'Vatican City', 
  'Monaco', 
  'San Marino', 
  'Liechtenstein', 
  'Malta', 
  'Andorra',
  'Luxembourg',
  'Singapore',
  'Bahrain',
  'Maldives',
  'Barbados',
  'Cyprus',
  'Mauritius',
  'Comoros',
  'Brunei'
];

interface BaseMapProps {
  worldData: FeatureCollection<Geometry, GeoJsonProperties>;
  center?: [number, number];
  zoom?: number;
  highlightedCountry?: string;
  onCountryClick: (countryName: string) => void;
}

export function BaseMap({
  worldData,
  center = [0, 20],
  zoom = 1,
  highlightedCountry,
  onCountryClick
}: BaseMapProps) {
  // Only calculate marker for the highlighted country if it's a small country
  const highlightedSmallCountryMarker = highlightedCountry && SMALL_COUNTRIES.includes(highlightedCountry)
    ? worldData.features
        .find(geo => geo.properties?.name === highlightedCountry)
        ?.geometry
        ? (() => {
            const feature = worldData.features.find(geo => geo.properties?.name === highlightedCountry)!;
            // Use the same projection configuration as ComposableMap's default settings
            const projection = geoMercator()
              .scale(100) // This matches react-simple-maps default
              .translate([480, 250]); // Center of 960x500 viewport (default)

            const pathGenerator = geoPath().projection(projection);
            const centroid = pathGenerator.centroid(feature);
            
            if (!centroid || centroid.length !== 2) return null;
            return {
              name: highlightedCountry,
              coordinates: centroid
            };
          })()
        : null
    : null;

  return (
    <div className="map-container">
      <ComposableMap 
        projection="geoMercator"
        projectionConfig={{
          scale: 100
        }}
        width={960}
        height={500}
      >
        <ZoomableGroup center={center} zoom={zoom}>
          <Geographies geography={worldData}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => {
                    onCountryClick(geo.properties?.name || '');
                  }}
                  style={{
                    default: {
                      fill: geo.properties?.name === highlightedCountry ? '#F53' : '#D6D6DA',
                      outline: "none",
                      stroke: "#444",
                      strokeWidth: 0.1
                    },
                    hover: {
                      fill: geo.properties?.name === highlightedCountry ? '#F53' : '#D6D6DA',
                      outline: "none",
                      stroke: "#444",
                      strokeWidth: 0.1
                    },
                    pressed: {
                      fill: geo.properties?.name === highlightedCountry ? '#E42' : '#D6D6DA',
                      outline: "none",
                      stroke: "#444",
                      strokeWidth: 0.1
                    }
                  }}
                />
              ))
            }
          </Geographies>
          {highlightedSmallCountryMarker && (
            <circle
              key={highlightedSmallCountryMarker.name}
              cx={highlightedSmallCountryMarker.coordinates[0]}
              cy={highlightedSmallCountryMarker.coordinates[1]}
              r="3"
              fill="none"
              stroke="#F53"
              strokeWidth="1"
              className="country-circle"
            />
          )}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}