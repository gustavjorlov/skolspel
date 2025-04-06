import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Feature, FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

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
  return (
    <div className="map-container">
      <ComposableMap projection="geoMercator">
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
                      outline: "none"
                    },
                    hover: {
                      fill: "#F53",
                      outline: "none"
                    },
                    pressed: {
                      fill: "#E42",
                      outline: "none"
                    }
                  }}
                />
              ))
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}