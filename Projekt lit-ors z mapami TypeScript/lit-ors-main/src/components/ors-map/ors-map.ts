import "@vaadin/notification";
import type { NotificationLitRenderer } from "@vaadin/notification/lit.js";
import { notificationRenderer } from "@vaadin/notification/lit.js";
import L, { LeafletMouseEvent } from "leaflet";
import { LitElement, css, html, render } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import eventBus from "../../event/eventBus";
import { OrsApi } from "../../ors-api/ors-api";
import "../ors-custom-contextmenu";
import "../ors-progress-bar";
import markerIconGreen from "./assets/img/marker-icon-green.png";
import markerIconRed from "./assets/img/marker-icon-red.png";
import { OrsRouteTab } from "../ors-route-tab/ors-route-tab";
import { travelModeIcons } from '../ors-route-tab/ors-route-tab';
 
interface RouteResponse {
  features: Array<{
    properties: {
      summary: {
        duration: number;
        distance: number;
      };
    };
  }>;
}
 
@customElement("ors-map")
 
export class OrsMap extends LitElement {
  @state() map?: L.Map;
  @state() contextMenu?: L.Popup;
  @state() markerGreen?: L.Marker = new L.Marker([0, 0], {
    opacity: 0,
    draggable: true,
  });
  @state() markerRed?: L.Marker = new L.Marker([0, 0], {
    opacity: 0,
    draggable: true,
  });
  @state() searchMarker: L.Marker = new L.Marker([0, 0], {
    opacity: 0,
  });
  @state() currentLatLng?: L.LatLng;
  @state() orsApi: OrsApi = new OrsApi();
  @state() routeStartLabel: string = "";
  @state() routeStopLabel: string = "";
  @state() searchLabel: string = "";
  @state() routeLayer?: L.GeoJSON = new L.GeoJSON();
  @state() travelMode: string = 'car';
 
  @property({ type: Number }) currentTabIdx: number = 0;
  @property({ type: String }) estimatedTime: string = '';
 
 
  @state() basemap: L.TileLayer = new L.TileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: "OpenStreetMap",
    }
  );
 
  @state() startIcon = new L.Icon({
    iconUrl: markerIconGreen,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
 
  @state() endIcon = new L.Icon({
    iconUrl: markerIconRed,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
 
  @state() routeStyle = {
    color: "#ff7800",
    weight: 5,
    opacity: 0.65,
  };
 
 
  initMap = (): void => {
    this.map = new L.Map("map", {
      center: new L.LatLng(51.236525, 22.4998601),
      zoom: 18,
    });
  };
 
  renderer: NotificationLitRenderer = () => html`
    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
      <div>Odległość pomiędzy punktami jest większa niż 600km</div>
    </vaadin-horizontal-layout>
  `;
 
  renderNotification = () => {
    render(
      html`<vaadin-notification
        class="notification"
        theme="error"
        duration="3000"
        position="bottom-center"
        ?opened=${true}
        ${notificationRenderer(this.renderer, [])}
      ></vaadin-notification>`,
      document.body
    );
  };
 
  // connectionError: NotificationLitRenderer = (error) => ;
 
 
  generateIsochronesFromAddress = async () => {
    try {
      const geocodedData = await this.orsApi.geocode(this.searchLabel);
      if (geocodedData && geocodedData.features && geocodedData.features.length > 0) {
        const coordinates = geocodedData.features[0].geometry.coordinates;
        this.generateIsochrone(coordinates);
      }
    } catch (error) {
      console.error("Błąd geokodowania:", error);
    }
  };
 
  generateIsochrone = async (coords) => {
    const url = "https://api.openrouteservice.org/v2/isochrones/driving-car";
    const apiKey = '5b3ce3597851110001cf624850325a7c453a4aaa883988e584a38445';
    const body = {
      locations: [[coords[0], coords[1]]],
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
  } catch (error) {
    console.error('Error fetching Isochrones:', error);
  }
};
 
  renderConnectionNotification = (error) => {
    render(
      html`<vaadin-notification
        class="notification"
        theme="error"
        duration="3000"
        position="bottom-center"
        ?opened=${true}
        ${notificationRenderer(
          () => html`
            <vaadin-horizontal-layout
              theme="spacing"
              style="align-items: center;"
            >
              <div>${error}</div>
            </vaadin-horizontal-layout>
          `
        )}
      ></vaadin-notification>`,
      document.body
    );
  };
 
  onRouteSelected(startPoint: L.LatLng, endPoint: L.LatLng) {
    this.orsApi.getRouteMatrix(startPoint, endPoint).then(matrixResult => {
      const routeTabElement = document.querySelector('ors-route-tab') as OrsRouteTab;
      if (routeTabElement) {
        routeTabElement.estimatedTime = `${(matrixResult.time / 3600).toFixed(2)} h`;
        routeTabElement.estimatedDistance = matrixResult.distance;
      }
    });
  }
 
  routeService = async (type?): Promise<void> => {
    if (this.map && this.markerGreen?.options.opacity === 1 && this.markerRed?.options.opacity === 1) {
      const startLatLng = this.markerGreen.getLatLng();
      const endLatLng = this.markerRed.getLatLng();
 
      try {
        const response = await this.orsApi.route(startLatLng, endLatLng);
        const feature = response as RouteResponse;
        if (feature.features.length > 0) {
          let { duration, distance } = feature.features[0].properties.summary;
 
          this.routeLayer!.clearLayers();
 
          this.routeLayer!.addData(feature as any);
        
          let timeString = '';
          if (duration < 60) {
            timeString = `Czas trasy: ${duration.toFixed(0)} s, Dystans: ${(distance / 1000).toFixed(2)} km`;
          } else {
            timeString = `Czas trasy: ${(duration / 60).toFixed(0)} min, Dystans: ${(distance / 1000).toFixed(2)} km`;
          }

          const modeIcon = travelModeIcons[this.travelMode] || 'vaadin:question-circle-o';
          const popupContent = html`
          <vaadin-icon icon="${modeIcon}"></vaadin-icon>
          ${timeString}
          `;
         
          const midPoint = L.latLng(
            (startLatLng.lat + endLatLng.lat) / 2,
            (startLatLng.lng + endLatLng.lng) / 2
          );
          const popupContainer = document.createElement('div');
          render(popupContent, popupContainer);
 
          L.popup({minWidth: 220, autoClose: true, closeOnClick: false})
          .setLatLng(midPoint)
          .setContent(popupContainer)
          .openOn(this.map);
      }
    } catch (error) {
      console.error('Error in routeService:', error);
   
      this.renderConnectionNotification(error);
    }
     
    }
    if (
      this.markerGreen!.options.opacity === 1 &&
      this.markerRed!.options.opacity === 1
    ) {
      if (
        this.markerGreen!.getLatLng().distanceTo(this.markerRed!.getLatLng()) <
        700000
      ) {
        try {
          const feature = await this.orsApi.route(
            this.markerGreen!.getLatLng(),
            this.markerRed!.getLatLng()
          );
          if ((feature as any).error) {
            throw new Error((feature as any).error.message);
          }
 
          this.routeLayer!.clearLayers().addData(feature as any);
          render(html``, document.body);
        } catch (e: any) {
          this.renderConnectionNotification(e);
        }
      } else if (
        this.markerGreen!.getLatLng().distanceTo(this.markerRed!.getLatLng()) >=
        700000
      ) {
        this.routeLayer!.clearLayers();
        this.renderNotification();
      }
    } else {
      render(html``, document.body);
    }
  };
 
  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has("currentTabIdx")) {
      if (this.currentLatLng) {
        this.updateContextMenu();
      }
      this.routeLayer?.clearLayers();
      this.routeStartLabel = ""
      this.routeStopLabel = "";
      this.searchLabel = ""
    }
   
  }
 
  updateContextMenu = (): void => {
    let orsContextMenuContainer = document.createElement("div");
 
    render(
      html`<ors-custom-contextmenu
        .currentTabIdx=${this.currentTabIdx}
        .map=${this.map}
        .currentLatLng=${this.currentLatLng}
      ></ors-custom-contextmenu>`,
      orsContextMenuContainer
    );
 
  this.contextMenu
    ?.setLatLng(this.currentLatLng!)
    .bindPopup(orsContextMenuContainer, {
      closeButton: false,
      minWidth: 250,
    })
    .addTo(this.map!)
    .openPopup();
};
 
 
  addListeners = (): void => {
    this.map!.on("contextmenu", (e: LeafletMouseEvent) => {
      this.currentLatLng = e.latlng;
      this.updateContextMenu();
    });
 
    this.markerGreen!.on("moveend", (e) => {
      this.currentLatLng = e.target.getLatLng();
      this.routeService();
 
      eventBus.dispatch("add-marker", { type: "start" });
      this.routeService();
    });
 
    this.markerRed!.on("moveend", (e) => {
      this.currentLatLng = e.target.getLatLng();
      eventBus.dispatch("add-marker", { type: "end" });
      this.routeService();
    });
 
    eventBus.on("add-marker", async (data) => {
      render(
        html`<progress-bar-request></progress-bar-request>`,
        document.body
      );
 
      switch (data.type) {
        case "start":
          this.markerGreen?.setOpacity(0);
 
          this.routeStartLabel = await this.orsApi.reverseGeocode(
            this.currentLatLng!
          );
 
          this.markerGreen!.setLatLng(this.currentLatLng!).setOpacity(1);
          break;
        case "end":
          this.markerRed?.setOpacity(0);
 
          this.routeStopLabel = await this.orsApi.reverseGeocode(
            this.currentLatLng!
          );
          this.markerRed!.setLatLng(this.currentLatLng!).setOpacity(1);
          break;
        case "search":
          this.searchMarker?.setOpacity(0);
          this.searchLabel  = await this.orsApi.reverseGeocode(
            this.currentLatLng!
          );
          this.searchMarker!.setLatLng(this.currentLatLng!).setOpacity(1);
          break;
      }
 
      this.contextMenu?.close();
      // this.currentLatLng = undefined;
      this.routeService(data.type);
    });
 
    eventBus.on("add-marker-geocode", async (data) => {
      const coords = new L.LatLng(data.coords[1], data.coords[0])!;
 
      switch (data.type) {
        case "start":
          this.markerGreen!.setLatLng(coords).setOpacity(1);
          this.routeStartLabel = data.label
          break;
        case "end":
          this.markerRed!.setLatLng(coords).setOpacity(1);
          this.routeStopLabel = data.label
          break;
        case "search":
          this.searchMarker!.setLatLng(coords).setOpacity(1);
          this.searchLabel = data.label
          break;
          case "isochrones":
        this.searchMarker?.setOpacity(0);
        this.searchLabel = await this.orsApi.reverseGeocode(coords);
        this.searchMarker!.setLatLng(coords).setOpacity(1);
        this.map?.flyTo(coords, 15);
        break;
      }
      this.contextMenu?.close();
      this.routeService(data.type);
    });
 
    eventBus.on("hide-marker", async (data) => {
      switch (data.type) {
        case "start":
          this.markerGreen!.setOpacity(0);
          break;
        case "end":
          this.markerRed!.setOpacity(0);
          break;
        case "search":
          this.searchMarker!.setOpacity(0);
          break;
      }
      this.contextMenu?.close();
      // this.currentLatLng = undefined;
      this.routeLayer!.clearLayers();
    });
  };
 
 
 
  firstUpdated(props: any) {  
    super.firstUpdated(props);
 
    this.addEventListener('generate-isochrones-from-address', () => {
      this.generateIsochronesFromAddress();
     
    });
    eventBus.on("travel-mode-changed", (data) => {
      this.orsApi.setProfile(data.mode);
      this.travelMode = data.mode;
   
      if (this.markerGreen?.options.opacity === 1 && this.markerRed?.options.opacity === 1) {
        this.routeService();
      }
    });
   
    eventBus.on("map-move-to", (data) => {
      if (this.map && data.coords) {
        this.map.flyTo([data.coords.lat, data.coords.lng], 15);
      }
    });
   
    this.initMap();
    this.basemap?.addTo(this.map!);
    this.contextMenu = new L.Popup();
    this.routeLayer!.setStyle(this.routeStyle).addTo(this.map!);
    this.markerGreen?.addTo(this.map!).setIcon(this.startIcon);
    this.markerRed?.addTo(this.map!).setIcon(this.endIcon);
    this.searchMarker?.addTo(this.map!).setIcon(this.startIcon);
    this.addListeners();
  }
 
  static styles? = css`
    .notification {
      display: flex !important;
      align-items: center;
      justify-content: center;
      height: calc(100vh - var(--docs-space-l) * 2);
    }
  `;
}