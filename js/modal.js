// Modal management
class Modal {
  constructor() {
    this.editingId = null;
    this.onSaveCallback = null;
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.close();
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && 
          document.getElementById('modal-overlay').classList.contains('open')) {
        this.save();
      }
    });

    document.getElementById('modal-overlay').addEventListener('click', e => {
      if (e.target === document.getElementById('modal-overlay')) this.close();
    });

    document.getElementById('file-input').addEventListener('change', e => this.loadFile(e));
  }

  open(id = null, specData = null) {
    this.editingId = id;
    document.getElementById('modal-error').textContent = '';
    document.getElementById('modal-title').textContent = id ? 'Edit Spec' : 'Add Spec';

    if (id && specData) {
      document.getElementById('spec-name-input').value = specData.name;
      document.getElementById('yaml-textarea').value = specData.yaml;
    } else {
      document.getElementById('spec-name-input').value = '';
      document.getElementById('yaml-textarea').value = '';
    }
    document.getElementById('modal-overlay').classList.add('open');
    setTimeout(() => document.getElementById('spec-name-input').focus(), 50);
  }

  close() {
    document.getElementById('modal-overlay').classList.remove('open');
    this.editingId = null;
  }

  save() {
    const name = document.getElementById('spec-name-input').value.trim();
    const yaml = document.getElementById('yaml-textarea').value.trim();
    const errEl = document.getElementById('modal-error');

    if (!name) {
      errEl.textContent = 'Please enter a spec name.';
      return;
    }
    if (!yaml) {
      errEl.textContent = 'Please enter YAML content.';
      return;
    }

    try {
      jsyaml.load(yaml);
    } catch (e) {
      errEl.textContent = 'Invalid YAML: ' + e.message;
      return;
    }

    if (this.onSaveCallback) {
      this.onSaveCallback(this.editingId, name, yaml);
    }
    this.close();
  }

  loadFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('yaml-textarea').value = e.target.result;
      if (!document.getElementById('spec-name-input').value) {
        document.getElementById('spec-name-input').value = file.name.replace(/\.(yaml|yml)$/i, '');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }
}

const modal = new Modal();
