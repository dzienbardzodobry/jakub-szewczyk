var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import "@vaadin/icon";
import "@vaadin/icons";
import "@vaadin/tabs";
import "@vaadin/tabsheet";
import "@vaadin/text-field";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import eventBus from "../../event/eventBus";
let OrsRouteTab = class OrsRouteTab extends LitElement {
    constructor() {
        super(...arguments);
        this.routeStartLabel = "";
        this.routeStopLabel = "";
        this.travelMode = "car";
        this.estimatedTime = '';
        this.estimatedDistance = 0;
    }
    firstUpdated(props) {
        super.firstUpdated(props);
    }
    setTravelMode(mode) {
        let profile;
        switch (mode) {
            case 'pedestrian':
                profile = 'foot-walking';
                break;
            case 'bike':
                profile = 'cycling-regular';
                break;
            case 'car':
                profile = 'driving-car';
                break;
            case 'bus':
                profile = 'driving-hgv';
                break;
            default:
                profile = 'driving-car';
        }
        this.travelMode = profile;
        eventBus.dispatch("travel-mode-changed", { mode: profile });
    }
    render() {
        return html `
    <div class="travel-modes">
    <vaadin-button @click="${() => this.setTravelMode('pedestrian')}">
    <vaadin-icon icon="vaadin:exit"></vaadin-icon> Pieszo
    </vaadin-button>
    <vaadin-button @click="${() => this.setTravelMode('bike')}">
      <vaadin-icon icon="vaadin:accessibility"></vaadin-icon> Rower
    </vaadin-button>
    <vaadin-button @click="${() => this.setTravelMode('car')}">
      <vaadin-icon icon="vaadin:car"></vaadin-icon> Samochód
    </vaadin-button>
    <vaadin-button @click="${() => this.setTravelMode('bus')}">
      <vaadin-icon icon="vaadin:bus"></vaadin-icon> Autobus
    </vaadin-button>  
    </div>
    <div>
    </div>

      <ors-search
        id=${"searchRouteStart"}
        .searchTerm=${this.routeStartLabel}
        .type=${"start"}
        .label=${"Punkt początkowy:"}
      ></ors-search>
      <ors-search
        id=${"searchRouteStop"}
        .searchTerm=${this.routeStopLabel}
        .type=${"end"}
        .label=${"Punkt końcowy:"}
      ></ors-search>
    `;
    }
};
OrsRouteTab.styles = css `
    :host {
      height: 100%;
    }
    vaadin-text-field {
      width: 100%;
    }
  `;
__decorate([
    property({ type: String })
], OrsRouteTab.prototype, "routeStartLabel", void 0);
__decorate([
    property({ type: String })
], OrsRouteTab.prototype, "routeStopLabel", void 0);
__decorate([
    property({ type: String })
], OrsRouteTab.prototype, "travelMode", void 0);
__decorate([
    property({ type: String })
], OrsRouteTab.prototype, "estimatedTime", void 0);
__decorate([
    property({ type: Number })
], OrsRouteTab.prototype, "estimatedDistance", void 0);
OrsRouteTab = __decorate([
    customElement("ors-route-tab")
], OrsRouteTab);
export { OrsRouteTab };
//# sourceMappingURL=ors-route-tab.js.map