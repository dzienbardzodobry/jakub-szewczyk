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
import "@vaadin/list-box";
import "@vaadin/item";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { OrsApi } from "../../ors-api/ors-api";
import eventBus from "../../event/eventBus";
let OrsSearchTab = class OrsSearchTab extends LitElement {
    constructor() {
        super(...arguments);
        this.searchTerm = "";
        this.id = "";
        this.label = "Wpisz adres:";
        this.placeholder = "Konstantynów 1A-1E, Lublin,LU,Polska";
        this.suggestions = [];
        this.type = "";
        this.orsApi = new OrsApi();
        this.inputTimeout = null;
    }
    firstUpdated(props) {
        super.firstUpdated(props);
    }
    handleSuggestionClick(suggestion) {
        this.searchTerm = suggestion;
        this.suggestions = [];
    }
    render() {
        return html `<vaadin-text-field
        id=${this.id}
        theme="small"
        clear-button-visible
        placeholder=${this.placeholder}
        label=${this.label}
        value=${this.searchTerm}
        @value-changed=${(e) => {
            const searchTerm = e.detail.value;
            if (searchTerm === "") {
                this.searchTerm = "";
                eventBus.dispatch("hide-marker", { type: this.type });
            }
            if (this.searchTerm === searchTerm)
                return;
            if (this.inputTimeout) {
                clearTimeout(this.inputTimeout);
            }
            if (searchTerm === "") {
                this.suggestions = [];
                return;
            }
            this.inputTimeout = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                const suggestions = yield this.orsApi.geocode(searchTerm);
                this.suggestions = suggestions;
            }), 500);
        }}
      >
        <vaadin-icon
          icon="vaadin:search"
          slot="suffix"
          @click=${(e) => {
            console.log("klik");
        }}
        ></vaadin-icon>
      </vaadin-text-field>
      <vaadin-list-box ?hidden=${!(this.suggestions.length > 0)}>
        ${this.suggestions.map((suggestion) => html `<vaadin-item
              @click=${() => {
            this.handleSuggestionClick(suggestion.properties.label);
            eventBus.dispatch("add-marker-geocode", {
                coords: suggestion.geometry.coordinates,
                type: this.type,
                label: suggestion.properties.label
            });
        }}
              >${suggestion.properties.label}</vaadin-item
            >`)}
      </vaadin-list-box> `;
    }
};
OrsSearchTab.styles = css `
    vaadin-text-field {
      width: 100%;
    }

    vaadin-list-box {
      max-height: 250px;
      overflow-y: auto;
      border: 1px solid #ccc;
      /* position: absolute;
      top:10; */
      background-color: white;
      z-index: 1;
      position: absolute;
      margin-right: var(--lumo-space-m);
    }

    vaadin-item {
      /* padding: 8px; */
      cursor: pointer;
    }

    vaadin-item:hover {
      background-color: #f4f4f4;
    }
  `;
__decorate([
    property({ type: String })
], OrsSearchTab.prototype, "searchTerm", void 0);
__decorate([
    property({ type: String })
], OrsSearchTab.prototype, "id", void 0);
__decorate([
    property({ type: String })
], OrsSearchTab.prototype, "label", void 0);
__decorate([
    property({ type: String })
], OrsSearchTab.prototype, "placeholder", void 0);
__decorate([
    property({ type: Array })
], OrsSearchTab.prototype, "suggestions", void 0);
__decorate([
    property({ type: String })
], OrsSearchTab.prototype, "type", void 0);
__decorate([
    state()
], OrsSearchTab.prototype, "orsApi", void 0);
__decorate([
    state()
], OrsSearchTab.prototype, "inputTimeout", void 0);
OrsSearchTab = __decorate([
    customElement("ors-search")
], OrsSearchTab);
export { OrsSearchTab };
//# sourceMappingURL=ors-search.js.map