import "@vaadin/button";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import L from 'leaflet';
import { OrsApi } from "../../ors-api/ors-api";
import { OrsMap } from "../ors-map";
import markerIconGreen from "../ors-map/assets/img/marker-icon-green.png";
import markerIconRed from "../ors-map/assets/img/marker-icon-red.png";
import eventBus from "../../event/eventBus";

@customElement("ors-custom-contextmenu")
export class OrsCustomContextmenu extends LitElement {
  
  @property({ type: Number }) currentTabIdx: number = 0;
  @property({ attribute: false }) map?: L.Map;
  @property({ attribute: false }) currentLatLng?: L.LatLng;
  @property({ type: Object }) isochroneData: any = null;
  @property({ type: String }) searchTerm = "";
  @property({ type: Array }) suggestions: any[] = [];
  @property() orsApi: OrsApi = new OrsApi();

  // Zakładka "Wyszukaj"
  searchContextMenu = () => html`
  <div class="search-container">
    <vaadin-list-box 
      class="suggestions-container" 
      ?hidden=${!(this.suggestions.length > 0)}
    >
      ${this.suggestions.map((suggestion) =>
        html`<vaadin-item @click=${() => this.handleSuggestionClick(suggestion)}>
          ${suggestion.properties.label}
        </vaadin-item>`
      )}
    </vaadin-list-box>
    <vaadin-text-field
      label="Wpisz adres:"
      placeholder="Wpisz adres"
      .value=${this.searchTerm}
      @value-changed=${this.handleSearchChange}
    ></vaadin-text-field>
  </div>
  `;
  handleSearchChange(e) {
    this.searchTerm = e.target.value;
    if (this.searchTerm.length > 2) {
      this.fetchSuggestions(this.searchTerm);
    } else {
      this.suggestions = [];
    }
  }

  async fetchSuggestions(query) {
    const suggestions = await this.orsApi.geocode(query);
    this.suggestions = suggestions;
  }

  handleSuggestionClick(suggestion) {
    this.searchTerm = suggestion.properties.label;
    this.suggestions = [];
    const coords = suggestion.geometry.coordinates;

    eventBus.dispatch("add-marker-geocode", {
      coords: suggestion.geometry.coordinates,
      type: "search",
      label: suggestion.properties.label
    });
    eventBus.dispatch("map-move-to", {
      coords: { lat: coords[1], lng: coords[0] }
    });
  }


generateRandomColor() {
  const red = Math.floor(Math.random() * 256);
  const green = Math.floor(Math.random() * 256);
  const blue = Math.floor(Math.random() * 256);
  return `rgb(${red}, ${green}, ${blue})`;
}

routeContextMenu = () => html`
<vaadin-button
  @click=${(e: Event) => {
    eventBus.dispatch("add-marker", { type: "start" });
  }}
>
  <div class="context-button">
    <img src=${markerIconGreen} height="22" />
    <span class="context-button-text">Ustaw punkt startowy</span>
  </div>
</vaadin-button>
<vaadin-button
  @click=${(e: Event) => {
    eventBus.dispatch("add-marker", { type: "end" });
  }}
>
  <div class="context-button">
    <img src=${markerIconRed} height="22" />
    <span class="context-button-text">Ustaw punkt końcowy</span>
  </div>
</vaadin-button>
`;

  async generateIsochrone() {
    if (!this.currentLatLng) return;

    const url = "https://api.openrouteservice.org/v2/isochrones/driving-car";
    const apiKey = '5b3ce3597851110001cf624850325a7c453a4aaa883988e584a38445';
    const body = {
      locations: [[this.currentLatLng.lng, this.currentLatLng.lat]],
      range: [15000],
      range_type: "distance",
      interval: 3000
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
          'Content-Type': 'application/json',
          'Authorization': apiKey
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.isochroneData = data;

      if (data && data.features) {
        data.features.forEach((feature) => {
          const color = this.generateRandomColor();
          const isochroneLayer = L.geoJSON(feature, {
            style: {
              color: color,
              opacity: 0.6,
              fillOpacity: 0.6
            }
          });

          if (this.map) {
            isochroneLayer.addTo(this.map);
          }
        });
      }
    } catch (error) {
      console.error('Error fetching Isochrones:', error);
    }
  }

  render() {
    switch (this.currentTabIdx) {
      case 0:
        return this.searchContextMenu();
      case 1:
        return this.routeContextMenu();
      case 2:
        return this.isochroneContextMenu();
    }
  }
  isochroneContextMenu = () => html`
    <vaadin-button @click=${this.generateIsochrone}>
      <div class="context-button">
        <span class="context-button-text">Generuj izochron</span>
      </div>
    </vaadin-button>
  `;
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        padding: 10px;
        width: 230px;
      }

      vaadin-button {
        width: 100%;
      }

      .context-button {
        display: flex;
        align-items: center;
      }

      .context-button-text {
        margin-left: 10px;
      }
      .search-container {
        position: relative;
        width: 100%;
      }
  
      .suggestions-container {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000; 
        max-height: 250px;
        overflow-y: auto;
        background-color: white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        border-radius: 4px;
        margin-top: 100px; 
      }
  
      vaadin-item {
        cursor: pointer;
        padding: 8px 16px;
      }
  
      vaadin-item:hover {
        background-color: #f4f4f4;
      }
  
      vaadin-text-field {
        width: 100%;
      }
    `;
  }
}
