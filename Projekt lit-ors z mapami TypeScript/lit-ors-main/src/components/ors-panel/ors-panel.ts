import "@vaadin/icon";
import "@vaadin/icons";
import "@vaadin/text-field";
import "@vaadin/tabsheet";
import "@vaadin/tabs";
import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';
import L from "leaflet";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "../ors-search"
import "../ors-route-tab"

@customElement("ors-panel")
export class OrsPanel extends LitElement {
  @property({ type: Object }) map?: L.Map;
  @property({ type: String}) routeStartLabel: string = "";
  @property({ type: String }) routeStopLabel: string = "";
  @property({ type: String }) searchLabel: string = "";
  @property({ type: Number }) currentTabIdx: number = 0;
  @property({ type: String }) address: string = '';

  @property({ type: Number }) rangeMax: number = 15; 
  @property({ type: Number }) intervalMax: number = 10; 
  @property({ type: Number }) rangeValue: number = 2; 
  @property({ type: Number }) intervalValue: number = 1; 

  onTabChanged = (e) => {
    this.currentTabIdx = e.detail.value;
   
    if (this.currentTabIdx === 2) { 
      this.initializeSliders();
    }
  };
  initializeSliders = () => {
   
    this.initializeRangeSlider();
    this.initializeIntervalSlider();
  };
  
  initializeRangeSlider = () => {
    const rangeSlider = this.shadowRoot?.getElementById('rangeSlider');
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
  
  initializeIntervalSlider = () => {
    const intervalSlider = this.shadowRoot?.getElementById('intervalSlider');
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
  
  firstUpdated(props: any) {
    super.firstUpdated(props);
    this.addEventListener('generate-isochrones-from-address', () => {
      this.generateIsochronesFromAddress();
    });
}

  renderIsochronesTab = () => {
    return html`
    
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

  onRangeChange = (e) => {
    this.rangeValue = e.target.value;
    this.intervalMax = Math.min(this.rangeValue, 10);
    this.generateIsochronesFromAddress();
  };

  onIntervalChange = (e) => {
    this.intervalValue = e.target.value;
    this.generateIsochronesFromAddress();
  };


  handleIsochronesAddressChange = (e) => {
    this.searchLabel = e.detail.value;
   
  };

  generateIsochronesFromAddress = async () => {
 
  };

  handleGenerateIsochronesFromAddress = () => {
    this.dispatchEvent(new CustomEvent('generate-isochrones-from-address'));
  };


  searchTab = () => {
    return  html`<vaadin-text-field
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
  </vaadin-text-field>`
  }

  routeTab = () => {
    return ;
  };

  render() {
    return html`
      <h4>Open Route Service - projekt</h4>
      <vaadin-tabsheet>
        <vaadin-tabs
          slot="tabs"
          @selected-changed=${(e) => {
            const { value } = e.detail;
            this.currentTabIdx = value;
            this.dispatchEvent(
              new CustomEvent("tab-index-changed", {
                detail: {
                  idx: value,
                },
              })
            );
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

  static styles? = css`
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
}
