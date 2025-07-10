import "@vaadin/icon";
import "@vaadin/icons";
import "@vaadin/tabs";
import "@vaadin/tabsheet";
import "@vaadin/text-field";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import eventBus from "../../event/eventBus";

export const travelModeIcons = {
  'foot-walking': 'vaadin:exit',
  'wheelchair': 'vaadin:accessibility',
  'driving-car': 'vaadin:car',
  'driving-hgv': 'vaadin:bus'
};


@customElement("ors-route-tab")
export class OrsRouteTab extends LitElement {
  @property({ type: String }) routeStartLabel: string = "";
  @property({ type: String }) routeStopLabel: string = "";
  @property({ type: String }) travelMode: string = "car";
  @property({ type: String }) activeMode: string = "car";  
  @property({ type: String }) estimatedTime: string = '';
  @property({ type: Number }) estimatedDistance: number = 0;
 
 
  firstUpdated(props: any) {
    super.firstUpdated(props);
    this.setTravelMode('car');
 
  }
 
  setTravelMode(mode) {
    let profile;
    switch (mode) {
      case 'pedestrian':
        profile = 'foot-walking';
        break;
      case 'wheelchair':
        profile = 'wheelchair';
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
    this.activeMode = profile;
    eventBus.dispatch("travel-mode-changed", { mode: profile });
  }
 
  render() {
    return html`
    <div>Wybór środka transportu:</div>
      <div class="travel-modes">
        <vaadin-button
          class=${this.activeMode === 'foot-walking' ? 'active-mode' : ''}
          @click="${() => this.setTravelMode('pedestrian')}">
          <vaadin-icon
            class=${this.activeMode === 'foot-walking' ? 'active-icon' : ''}
            icon="vaadin:exit">
          </vaadin-icon> 
        </vaadin-button>
        <vaadin-button
          class=${this.activeMode === 'wheelchair' ? 'active-mode' : ''}
          @click="${() => this.setTravelMode('wheelchair')}">
          <vaadin-icon icon="vaadin:accessibility"></vaadin-icon> 
        </vaadin-button>
        <vaadin-button
          class=${this.activeMode === 'driving-car' ? 'active-mode' : ''}
          @click="${() => this.setTravelMode('car')}">
          <vaadin-icon icon="vaadin:car"></vaadin-icon> 
        </vaadin-button>
        <vaadin-button
          class=${this.activeMode === 'driving-hgv' ? 'active-mode' : ''}
          @click="${() => this.setTravelMode('bus')}">
          <vaadin-icon icon="vaadin:bus"></vaadin-icon> 
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
 
 
  static styles? = css`
    :host {
      height: 100%;
    }
    vaadin-text-field {
      width: 100%;
    }
    .active-mode {
      border: 2px solid green;
      color: green;
    }
    .vaadin-button {
      flex-grow: 1;
      margin: 0 4px; 
      padding: 10px 0; 
  }
  .vaadin-icon {
      width: 24px; 
      height: 24px; 
  }
    `;
}
 