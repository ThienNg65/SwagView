// Live editor with preview
class Editor {
  constructor() {
    this.currentSpecId = null;
    this.currentYaml = '';
    this.isEditing = false;
    this.editPreviewRenderer = null;
    this.debounceTimer = null;
    this.renderScheduled = false;
    this.setupEditor();
  }

  setupEditor() {
    const editorContainer = document.getElementById('editor-container');
    if (!editorContainer) return;

    // Initialize CodeMirror or simple textarea editor
    this.editor = document.getElementById('live-editor-textarea');
    if (this.editor) {
      this.editor.addEventListener('input', () => this.onEditorChange());
    }

    this.editPreviewRenderer = new SwaggerRenderer();
  }

  toggle() {
    this.isEditing = !this.isEditing;
    const container = document.getElementById('editor-container');
    const swagger = document.getElementById('swagger-container');
    const welcome = document.getElementById('welcome');
    const main = document.getElementById('main');
    
    if (this.isEditing) {
      // Batch all DOM changes together to avoid layout thrashing
      requestAnimationFrame(() => {
        // Apply classes which trigger transitions
        main.classList.add('editing-mode');
        requestAnimationFrame(() => {
          container.classList.add('visible');
          // Hide welcome/swagger after editor is visible (after transition starts)
          setTimeout(() => {
            swagger.style.display = 'none';
            welcome.style.display = 'none';
          }, 150);
        });
      });
    } else {
      requestAnimationFrame(() => {
        container.classList.remove('visible');
        main.classList.remove('editing-mode');
        if (this.currentSpecId) {
          swagger.style.display = 'block';
        }
      });
    }
  }

  open(specId, yamlContent) {
    this.currentSpecId = specId;
    this.currentYaml = yamlContent;
    this.isEditing = false; // Reset state before toggle
    const textarea = document.getElementById('live-editor-textarea');
    if (textarea) {
      textarea.value = yamlContent;
    }
    // Defer toggle and preview to next frame to avoid layout thrashing
    requestAnimationFrame(() => {
      this.toggle();
      requestAnimationFrame(() => {
        this.updatePreview(); // Render preview after layout is done
      });
    });
  }

  close() {
    this.toggle();
    this.currentSpecId = null;
    this.currentYaml = '';
    // Restore swagger container view
    document.getElementById('swagger-container').style.display = 'block';
  }

  onEditorChange() {
    // Aggressive debounce for smooth typing experience (800ms)
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.updatePreview();
    }, 800);
  }

  updatePreview() {
    const textarea = document.getElementById('live-editor-textarea');
    if (!textarea) return;

    const yaml = textarea.value;
    const previewContainer = document.getElementById('editor-preview');
    const errorEl = document.getElementById('editor-error');
    
    try {
      jsyaml.load(yaml); // Validate YAML
      // Only re-render if container is empty or needs update
      if (!previewContainer.querySelector('#editor-swagger-ui')) {
        previewContainer.innerHTML = '<div id="editor-swagger-ui"></div>';
      }
      this.editPreviewRenderer.render(yaml, 'editor-swagger-ui');
      errorEl.textContent = '';
      errorEl.style.opacity = '0';
      errorEl.style.maxHeight = '0';
    } catch (e) {
      errorEl.textContent = 'Error: ' + e.message;
      errorEl.style.opacity = '1';
      errorEl.style.maxHeight = '100px';
    }
  }

  save() {
    const textarea = document.getElementById('live-editor-textarea');
    if (!textarea || !this.currentSpecId) return;

    const yaml = textarea.value;
    try {
      jsyaml.load(yaml);
      SpecStorage.updateSpec(this.currentSpecId, 
        SpecStorage.getSpec(this.currentSpecId).name, 
        yaml);
      // Refresh the main view
      app.selectSpec(this.currentSpecId);
      this.close();
    } catch (e) {
      document.getElementById('editor-error').textContent = 'Invalid YAML: ' + e.message;
    }
  }
}

const editor = new Editor();
