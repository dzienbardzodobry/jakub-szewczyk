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
import "@vaadin/icon";
import "@vaadin/icons";
import "@vaadin/text-field";
import "@vaadin/tabsheet";
import "@vaadin/tabs";
import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../ors-search";
import "../ors-route-tab";
let OrsPanel = class OrsPanel extends LitElement {
    constructor() {
        super(...arguments);
        this.routeStartLabel = "";
        this.routeStopLabel = "";
        this.searchLabel = "";
        this.currentTabIdx = 0;
        this.address = '';
        this.rangeMax = 15;
        this.intervalMax = 10;
        this.rangeValue = 2;
        this.intervalValue = 1;
        this.onTabChanged = (e) => {
            this.currentTabIdx = e.detail.value;
            if (this.currentTabIdx === 2) {
                this.initializeSliders();
            }
        };
        this.initializeSliders = () => {
            this.initializeRangeSlider();
            this.initializeIntervalSlider();
        };
        this.initializeRangeSlider = () => {
            var _a;
            const rangeSlider = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.getElementById('rangeSlider');
            if (rangeSlider) {
                noUiSlider.create(rangeSlider, {
                    start: [this.rangeValue],
                    connect: true,
                    range: {
                        'min': 2,
                        'max': this.rangeMax
                    }
                });
            }
        };
        this.initializeIntervalSlider = () => {
            var _a;
            const intervalSlider = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.getElementById('intervalSlider');
            if (intervalSlider) {
                noUiSlider.create(intervalSlider, {
                    start: [this.intervalValue],
                    connect: true,
                    range: {
                        'min': 1,
                        'max': this.intervalMax
                    }
                });
            }
        };
        this.renderIsochronesTab = () => {
            return html `
    
      <vaadin-text-field
        id="isochronesAddress"
        theme="small"
        clear-button-visible
        placeholder="Wpisz adres dla izochronów"
        label="Adres izochronów:"
        @value-changed=${this.handleIsochronesAddressChange}
      ></vaadin-text-field>

      <div>Zasięg: ${this.rangeValue} km</div>
      <vaadin-slider
      min="2"
      max="${this.rangeMax}"
      step="1"
      value="${this.rangeValue}"
      @change="${this.onRangeChange}"
    ></vaadin-slider>
    <div>Interwał: ${this.intervalValue} km</div>
      <vaadin-slider
        min="1"
        max="${this.intervalMax}"
        step="1"
        value="${this.intervalValue}"
        @change="${this.onIntervalChange}"
      ></vaadin-slider>
      <button @click="${this.handleGenerateIsochronesFromAddress}">Generuj Izochrony</button>
    `;
        };
        this.onRangeChange = (e) => {
            this.rangeValue = e.target.value;
            this.intervalMax = Math.min(this.rangeValue, 10);
            this.generateIsochronesFromAddress();
        };
        this.onIntervalChange = (e) => {
            this.intervalValue = e.target.value;
            this.generateIsochronesFromAddress();
        };
        this.handleIsochronesAddressChange = (e) => {
            this.searchLabel = e.detail.value;
        };
        this.generateIsochronesFromAddress = () => __awaiter(this, void 0, void 0, function* () {
        });
        this.handleGenerateIsochronesFromAddress = () => {
            this.dispatchEvent(new CustomEvent('generate-isochrones-from-address'));
        };
        this.searchTab = () => {
            return html `<vaadin-text-field
    id="searchAddress"
    theme="small"
    clear-button-visible
    placeholder="Konstantynów 1A-1E, Lublin,LU,Polska"
    label="Wpisz adres:"
  >
    <vaadin-icon
      icon="vaadin:search"
      slot="suffix"
      @click=${(e) => {
                console.log("klik");
            }}
    ></vaadin-icon>
  </vaadin-text-field>`;
        };
        this.routeTab = () => {
            return;
        };
    }
    firstUpdated(props) {
        super.firstUpdated(props);
        this.addEventListener('generate-isochrones-from-address', () => {
            this.generateIsochronesFromAddress();
        });
    }
    render() {
        return html `
      <h4>Open Route Service - projekt</h4>
      <vaadin-tabsheet>
        <vaadin-tabs
          slot="tabs"
          @selected-changed=${(e) => {
            const { value } = e.detail;
            this.currentTabIdx = value;
            this.dispatchEvent(new CustomEvent("tab-index-changed", {
                detail: {
                    idx: value,
                },
            }));
        }}
        >
          <vaadin-tab id="find-tab">Wyszukaj</vaadin-tab>
          <vaadin-tab id="route-tab">Trasa</vaadin-tab>
          <vaadin-tab id="reach-tab">Izochrony</vaadin-tab>
        </vaadin-tabs>
  
        <div tab="find-tab"><ors-search .type=${"search"} .searchTerm=${this.searchLabel}> </ors-search></div>
        <div tab="route-tab"><ors-route-tab .routeStartLabel=${this.routeStartLabel} routeStopLabel=${this.routeStopLabel} ></ors-route-tab></div>
        <div tab="reach-tab"><ors-search .type=${"isochrones"} .searchTerm=${this.searchLabel}></ors-search></div>
        <div tab="reach-tab">${this.renderIsochronesTab()}</div>
        </vaadin-tabsheet>
    `;
    }
};
OrsPanel.styles = css `
    :host {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 10px;
      background-color: rgba(255, 255, 255, 0.9);
      width: 400px;
      height: 94%;
      overflow: auto;
    }

    h4 {
      text-align: center;
    }
    vaadin-text-field {
      width: 100%;
    }
    vaadin-tabsheet {
      height: 93%;
    }
  `;
__decorate([
    property({ type: Object })
], OrsPanel.prototype, "map", void 0);
__decorate([
    property({ type: String })
], OrsPanel.prototype, "routeStartLabel", void 0);
__decorate([
    property({ type: String })
], OrsPanel.prototype, "routeStopLabel", void 0);
__decorate([
    property({ type: String })
], OrsPanel.prototype, "searchLabel", void 0);
__decorate([
    property({ type: Number })
], OrsPanel.prototype, "currentTabIdx", void 0);
__decorate([
    property({ type: String })
], OrsPanel.prototype, "address", void 0);
__decorate([
    property({ type: Number })
], OrsPanel.prototype, "rangeMax", void 0);
__decorate([
    property({ type: Number })
], OrsPanel.prototype, "intervalMax", void 0);
__decorate([
    property({ type: Number })
], OrsPanel.prototype, "rangeValue", void 0);
__decorate([
    property({ type: Number })
], OrsPanel.prototype, "intervalValue", void 0);
OrsPanel = __decorate([
    customElement("ors-panel")
], OrsPanel);
export { OrsPanel };
//# sourceMappingURL=ors-panel.js.map