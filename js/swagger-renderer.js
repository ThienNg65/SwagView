// Swagger UI rendering
class SwaggerRenderer {
  constructor() {
    this.swaggerUI = null;
  }

  render(yaml, containerId = 'swagger-ui') {
    const container = document.getElementById(containerId);
    
    try {
      const spec = jsyaml.load(yaml);
      
      // Only clear and re-render if container is empty (avoid unnecessary DOM churn)
      if (!this.swaggerUI || !container.querySelector('.swagger-ui')) {
        container.innerHTML = '<div id="' + containerId + '"></div>';
      }
      
      this.swaggerUI = SwaggerUIBundle({
        spec: spec,
        domNode: document.getElementById(containerId),
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: 'StandaloneLayout',
        deepLinking: true,
      });
      return true;
    } catch (e) {
      container.innerHTML = `<div style="padding:40px; color:#c0392b; font-family:monospace;">
        <strong>Failed to parse YAML:</strong><br/><pre style="margin-top:10px; white-space:pre-wrap">${this.escHtml(e.message)}</pre>
      </div>`;
      return false;
    }
  }

  escHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

const swaggerRenderer = new SwaggerRenderer();
