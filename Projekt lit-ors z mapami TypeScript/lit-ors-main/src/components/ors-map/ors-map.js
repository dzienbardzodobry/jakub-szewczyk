var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import "@vaadin/notification";
import { notificationRenderer } from "@vaadin/notification/lit.js";
import L from "leaflet";
import { LitElement, css, html, render } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import eventBus from "../../event/eventBus";
import { OrsApi } from "../../ors-api/ors-api";
import "../ors-custom-contextmenu";
import "../ors-progress-bar";
import markerIconGreen from "./assets/img/marker-icon-green.png";
import markerIconRed from "./assets/img/marker-icon-red.png";
let OrsMap = class OrsMap extends LitElement {
    constructor() {
        super(...arguments);
        this.markerGreen = new L.Marker([0, 0], {
            opacity: 0,
            draggable: true,
        });
        this.markerRed = new L.Marker([0, 0], {
            opacity: 0,
            draggable: true,
        });
        this.searchMarker = new L.Marker([0, 0], {
            opacity: 0,
        });
        this.orsApi = new OrsApi();
        this.routeStartLabel = "";
        this.routeStopLabel = "";
        this.searchLabel = "";
        this.routeLayer = new L.GeoJSON();
        this.travelMode = 'driving-car';
        this.currentTabIdx = 0;
        this.estimatedTime = '';
        this.basemap = new L.TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "OpenStreetMap",
        });
        this.startIcon = new L.Icon({
            iconUrl: markerIconGreen,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
        });
        this.endIcon = new L.Icon({
            iconUrl: markerIconRed,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
        });
        this.routeStyle = {
            color: "#ff7800",
            weight: 5,
            opacity: 0.65,
        };
        this.initMap = () => {
            this.map = new L.Map("map", {
                center: new L.LatLng(51.236525, 22.4998601),
                zoom: 18,
            });
        };
        this.renderer = () => html `
    <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
      <div>Odległość pomiędzy punktami jest większa niż 600km</div>
    </vaadin-horizontal-layout>
  `;
        this.renderNotification = () => {
            render(html `<vaadin-notification
        class="notification"
        theme="error"
        duration="3000"
        position="bottom-center"
        ?opened=${true}
        ${notificationRenderer(this.renderer, [])}
      ></vaadin-notification>`, document.body);
        };
        // connectionError: NotificationLitRenderer = (error) => ;
        this.generateIsochronesFromAddress = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const geocodedData = yield this.orsApi.geocode(this.searchLabel);
                if (geocodedData && geocodedData.features && geocodedData.features.length > 0) {
                    const coordinates = geocodedData.features[0].geometry.coordinates;
                    this.generateIsochrone(coordinates);
                }
            }
            catch (error) {
                console.error("Błąd geokodowania:", error);
            }
        });
        this.generateIsochrone = (coords) => __awaiter(this, void 0, void 0, function* () {
            const url = "https://api.openrouteservice.org/v2/isochrones/driving-car";
            const apiKey = '5b3ce3597851110001cf624850325a7c453a4aaa883988e584a38445';
            const body = {
                locations: [[coords[0], coords[1]]],
                range: [15000],
                range_type: "distance",
                interval: 3000
            };
            try {
                const response = yield fetch(url, {
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
                const data = yield response.json();
            }
            catch (error) {
                console.error('Error fetching Isochrones:', error);
            }
        });
        this.renderConnectionNotification = (error) => {
            render(html `<vaadin-notification
        class="notification"
        theme="error"
        duration="3000"
        position="bottom-center"
        ?opened=${true}
        ${notificationRenderer(() => html `
            <vaadin-horizontal-layout
              theme="spacing"
              style="align-items: center;"
            >
              <div>${error}</div>
            </vaadin-horizontal-layout>
          `)}
      ></vaadin-notification>`, document.body);
        };
        this.routeService = (type) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (this.map && ((_a = this.markerGreen) === null || _a === void 0 ? void 0 : _a.options.opacity) === 1 && ((_b = this.markerRed) === null || _b === void 0 ? void 0 : _b.options.opacity) === 1) {
                const startLatLng = this.markerGreen.getLatLng();
                const endLatLng = this.markerRed.getLatLng();
                try {
                    const response = yield this.orsApi.route(startLatLng, endLatLng);
                    const feature = response;
                    if (feature.features.length > 0) {
                        let { duration, distance } = feature.features[0].properties.summary;
                        this.routeLayer.clearLayers();
                        this.routeLayer.addData(feature);
                        const popupContent = `Czas trasy: ${(duration / 60).toFixed(0)} min, Dystans: ${(distance / 1000).toFixed(2)} km`;
                        const midPoint = L.latLng((startLatLng.lat + endLatLng.lat) / 2, (startLatLng.lng + endLatLng.lng) / 2);
                        L.popup({ minWidth: 220, autoClose: true, closeOnClick: false })
                            .setLatLng(midPoint)
                            .setContent(popupContent)
                            .openOn(this.map);
                    }
                }
                catch (error) {
                    console.error('Error in routeService:', error);
                    this.renderConnectionNotification(error);
                }
            }
            if (this.markerGreen.options.opacity === 1 &&
                this.markerRed.options.opacity === 1) {
                if (this.markerGreen.getLatLng().distanceTo(this.markerRed.getLatLng()) <
                    700000) {
                    try {
                        const feature = yield this.orsApi.route(this.markerGreen.getLatLng(), this.markerRed.getLatLng());
                        if (feature.error) {
                            throw new Error(feature.error.message);
                        }
                        this.routeLayer.clearLayers().addData(feature);
                        render(html ``, document.body);
                    }
                    catch (e) {
                        this.renderConnectionNotification(e);
                    }
                }
                else if (this.markerGreen.getLatLng().distanceTo(this.markerRed.getLatLng()) >=
                    700000) {
                    this.routeLayer.clearLayers();
                    this.renderNotification();
                }
            }
            else {
                render(html ``, document.body);
            }
        });
        this.updateContextMenu = () => {
            var _a;
            let orsContextMenuContainer = document.createElement("div");
            render(html `<ors-custom-contextmenu
        .currentTabIdx=${this.currentTabIdx}
        .map=${this.map}
        .currentLatLng=${this.currentLatLng}
      ></ors-custom-contextmenu>`, orsContextMenuContainer);
            (_a = this.contextMenu) === null || _a === void 0 ? void 0 : _a.setLatLng(this.currentLatLng).bindPopup(orsContextMenuContainer, {
                closeButton: false,
                minWidth: 250,
            }).addTo(this.map).openPopup();
        };
        this.addListeners = () => {
            this.map.on("contextmenu", (e) => {
                this.currentLatLng = e.latlng;
                this.updateContextMenu();
            });
            this.markerGreen.on("moveend", (e) => {
                this.currentLatLng = e.target.getLatLng();
                this.routeService();
                eventBus.dispatch("add-marker", { type: "start" });
                this.routeService();
            });
            this.markerRed.on("moveend", (e) => {
                this.currentLatLng = e.target.getLatLng();
                eventBus.dispatch("add-marker", { type: "end" });
                this.routeService();
            });
            eventBus.on("add-marker", (data) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                render(html `<progress-bar-request></progress-bar-request>`, document.body);
                switch (data.type) {
                    case "start":
                        (_a = this.markerGreen) === null || _a === void 0 ? void 0 : _a.setOpacity(0);
                        this.routeStartLabel = yield this.orsApi.reverseGeocode(this.currentLatLng);
                        this.markerGreen.setLatLng(this.currentLatLng).setOpacity(1);
                        break;
                    case "end":
                        (_b = this.markerRed) === null || _b === void 0 ? void 0 : _b.setOpacity(0);
                        this.routeStopLabel = yield this.orsApi.reverseGeocode(this.currentLatLng);
                        this.markerRed.setLatLng(this.currentLatLng).setOpacity(1);
                        break;
                    case "search":
                        (_c = this.searchMarker) === null || _c === void 0 ? void 0 : _c.setOpacity(0);
                        this.searchLabel = yield this.orsApi.reverseGeocode(this.currentLatLng);
                        this.searchMarker.setLatLng(this.currentLatLng).setOpacity(1);
                        break;
                }
                (_d = this.contextMenu) === null || _d === void 0 ? void 0 : _d.close();
                // this.currentLatLng = undefined;
                this.routeService(data.type);
            }));
            eventBus.on("add-marker-geocode", (data) => __awaiter(this, void 0, void 0, function* () {
                var _e, _f, _g;
                const coords = new L.LatLng(data.coords[1], data.coords[0]);
                switch (data.type) {
                    case "start":
                        this.markerGreen.setLatLng(coords).setOpacity(1);
                        this.routeStartLabel = data.label;
                        break;
                    case "end":
                        this.markerRed.setLatLng(coords).setOpacity(1);
                        this.routeStopLabel = data.label;
                        break;
                    case "search":
                        this.searchMarker.setLatLng(coords).setOpacity(1);
                        this.searchLabel = data.label;
                        break;
                    case "isochrones":
                        (_e = this.searchMarker) === null || _e === void 0 ? void 0 : _e.setOpacity(0);
                        this.searchLabel = yield this.orsApi.reverseGeocode(coords);
                        this.searchMarker.setLatLng(coords).setOpacity(1);
                        (_f = this.map) === null || _f === void 0 ? void 0 : _f.flyTo(coords, 15);
                        break;
                }
                (_g = this.contextMenu) === null || _g === void 0 ? void 0 : _g.close();
                // this.currentLatLng = undefined;
                this.routeService(data.type);
            }));
            eventBus.on("hide-marker", (data) => __awaiter(this, void 0, void 0, function* () {
                var _h;
                switch (data.type) {
                    case "start":
                        this.markerGreen.setOpacity(0);
                        break;
                    case "end":
                        this.markerRed.setOpacity(0);
                        break;
                    case "search":
                        this.searchMarker.setOpacity(0);
                        break;
                }
                (_h = this.contextMenu) === null || _h === void 0 ? void 0 : _h.close();
                // this.currentLatLng = undefined;
                this.routeLayer.clearLayers();
            }));
        };
    }
    onRouteSelected(startPoint, endPoint) {
        this.orsApi.getRouteMatrix(startPoint, endPoint).then(matrixResult => {
            const routeTabElement = document.querySelector('ors-route-tab');
            if (routeTabElement) {
                routeTabElement.estimatedTime = `${(matrixResult.time / 3600).toFixed(2)} h`;
                routeTabElement.estimatedDistance = matrixResult.distance;
            }
        });
    }
    updated(changedProperties) {
        var _a;
        if (changedProperties.has("currentTabIdx")) {
            if (this.currentLatLng) {
                this.updateContextMenu();
            }
            (_a = this.routeLayer) === null || _a === void 0 ? void 0 : _a.clearLayers();
            this.routeStartLabel = "";
            this.routeStopLabel = "";
            this.searchLabel = "";
        }
    }
    firstUpdated(props) {
        var _a, _b, _c, _d;
        super.firstUpdated(props);
        this.addEventListener('generate-isochrones-from-address', () => {
            this.generateIsochronesFromAddress();
        });
        eventBus.on("travel-mode-changed", (data) => {
            var _a, _b;
            this.orsApi.setProfile(data.mode);
            this.travelMode = data.mode;
            if (((_a = this.markerGreen) === null || _a === void 0 ? void 0 : _a.options.opacity) === 1 && ((_b = this.markerRed) === null || _b === void 0 ? void 0 : _b.options.opacity) === 1) {
                this.routeService();
            }
        });
        eventBus.on("map-move-to", (data) => {
            if (this.map && data.coords) {
                this.map.flyTo([data.coords.lat, data.coords.lng], 15);
            }
        });
        this.initMap();
        (_a = this.basemap) === null || _a === void 0 ? void 0 : _a.addTo(this.map);
        this.contextMenu = new L.Popup();
        this.routeLayer.setStyle(this.routeStyle).addTo(this.map);
        (_b = this.markerGreen) === null || _b === void 0 ? void 0 : _b.addTo(this.map).setIcon(this.startIcon);
        (_c = this.markerRed) === null || _c === void 0 ? void 0 : _c.addTo(this.map).setIcon(this.endIcon);
        (_d = this.searchMarker) === null || _d === void 0 ? void 0 : _d.addTo(this.map).setIcon(this.startIcon);
        this.addListeners();
    }
};
OrsMap.styles = css `
    .notification {
      display: flex !important;
      align-items: center;
      justify-content: center;
      height: calc(100vh - var(--docs-space-l) * 2);
    }
  `;
__decorate([
    state()
], OrsMap.prototype, "map", void 0);
__decorate([
    state()
], OrsMap.prototype, "contextMenu", void 0);
__decorate([
    state()
], OrsMap.prototype, "markerGreen", void 0);
__decorate([
    state()
], OrsMap.prototype, "markerRed", void 0);
__decorate([
    state()
], OrsMap.prototype, "searchMarker", void 0);
__decorate([
    state()
], OrsMap.prototype, "currentLatLng", void 0);
__decorate([
    state()
], OrsMap.prototype, "orsApi", void 0);
__decorate([
    state()
], OrsMap.prototype, "routeStartLabel", void 0);
__decorate([
    state()
], OrsMap.prototype, "routeStopLabel", void 0);
__decorate([
    state()
], OrsMap.prototype, "searchLabel", void 0);
__decorate([
    state()
], OrsMap.prototype, "routeLayer", void 0);
__decorate([
    state()
], OrsMap.prototype, "travelMode", void 0);
__decorate([
    property({ type: Number })
], OrsMap.prototype, "currentTabIdx", void 0);
__decorate([
    property({ type: String })
], OrsMap.prototype, "estimatedTime", void 0);
__decorate([
    state()
], OrsMap.prototype, "basemap", void 0);
__decorate([
    state()
], OrsMap.prototype, "startIcon", void 0);
__decorate([
    state()
], OrsMap.prototype, "endIcon", void 0);
__decorate([
    state()
], OrsMap.prototype, "routeStyle", void 0);
OrsMap = __decorate([
    customElement("ors-map")
], OrsMap);
export { OrsMap };
//# sourceMappingURL=ors-map.js.map