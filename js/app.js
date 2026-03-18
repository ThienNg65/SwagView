// Main application controller
class App {
  constructor() {
    this.specs = [];
    this.activeId = null;
    this.init();
  }

  init() {
    this.loadSpecs();
    this.setupEventListeners();
    this.renderSidebar();
    
    // Auto-select first spec if available
    if (this.specs.length > 0) {
      this.selectSpec(this.specs[0].id);
    }
  }

  loadSpecs() {
    this.specs = SpecStorage.loadSpecs();
  }

  setupEventListeners() {
    // Sidebar callbacks
    sidebar.onSelectCallback = (id) => this.selectSpec(id);
    sidebar.onEditCallback = (id) => this.editSpec(id);
    sidebar.onLiveEditCallback = (id) => this.liveEditSpec(id);
    sidebar.onDeleteCallback = (id) => this.deleteSpec(id);

    // Modal callback
    modal.onSaveCallback = (id, name, yaml) => this.saveSpec(id, name, yaml);

    // Add spec button
    document.getElementById('btn-add').addEventListener('click', () => modal.open());
  }

  renderSidebar() {
    sidebar.setSpecs(this.specs, this.activeId);
  }

  selectSpec(id) {
    const spec = this.specs.find(s => s.id === id);
    if (!spec) return;

    this.activeId = id;
    sidebar.setActiveSpec(id);

    document.getElementById('welcome').style.display = 'none';
    const container = document.getElementById('swagger-container');
    // Always show the container - let CSS media handle split-view logic
    container.style.display = 'block';

    swaggerRenderer.render(spec.yaml, 'swagger-ui-main');
  }

  editSpec(id) {
    const spec = this.specs.find(s => s.id === id);
    if (!spec) return;
    modal.open(id, spec);
  }

  liveEditSpec(id) {
    const spec = this.specs.find(s => s.id === id);
    if (!spec) return;
    // Make sure this spec is selected first
    this.selectSpec(id);
    // Then open the live editor
    setTimeout(() => {
      editor.open(id, spec.yaml);
    }, 100);
  }

  saveSpec(id, name, yaml) {
    if (id) {
      // Update existing
      SpecStorage.updateSpec(id, name, yaml);
      const spec = this.specs.find(s => s.id === id);
      spec.name = name;
      spec.yaml = yaml;
      if (id === this.activeId) {
        this.selectSpec(this.activeId);
      }
    } else {
      // Create new
      const newId = SpecStorage.addSpec(name, yaml);
      this.specs = SpecStorage.loadSpecs();
      this.renderSidebar();
      this.selectSpec(newId);
    }
  }

  deleteSpec(id) {
    if (!confirm('Delete this spec?')) return;
    SpecStorage.deleteSpec(id);
    this.specs = SpecStorage.loadSpecs();
    
    if (this.activeId === id) {
      this.activeId = null;
      document.getElementById('swagger-container').style.display = 'none';
      document.getElementById('welcome').style.display = 'flex';
    }
    this.renderSidebar();
  }

  toggleEditMode() {
    if (!this.activeId) {
      alert('Please select a spec first');
      return;
    }
    const spec = this.specs.find(s => s.id === this.activeId);
    editor.open(this.activeId, spec.yaml);
  }
}

let app;

// Initialize app when DOM is ready and js-yaml is loaded
function initApp() {
  if (typeof jsyaml === 'undefined') {
    setTimeout(initApp, 100);
    return;
  }
  app = new App();
}

document.addEventListener('DOMContentLoaded', initApp);
