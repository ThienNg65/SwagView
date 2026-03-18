// Sidebar management
class Sidebar {
  constructor() {
    this.specs = [];
    this.activeId = null;
    this.onSelectCallback = null;
    this.onEditCallback = null;
    this.onLiveEditCallback = null;
    this.onDeleteCallback = null;
  }

  setSpecs(specs, activeId = null) {
    this.specs = specs;
    this.activeId = activeId;
    this.render();
  }

  setActiveSpec(id) {
    this.activeId = id;
    this.render();
  }

  render() {
    const list = document.getElementById('spec-list');
    if (this.specs.length === 0) {
      list.innerHTML = '<div id="empty-state">No specs yet.<br/>Click <strong>+ Add Spec</strong> to get started.</div>';
      return;
    }
    list.innerHTML = this.specs.map(s => `
      <div class="spec-item ${s.id === this.activeId ? 'active' : ''}" onclick="sidebar.selectSpec('${s.id}')">
        <span class="spec-item-name" title="${this.escHtml(s.name)}">${this.escHtml(s.name)}</span>
        <span class="spec-item-actions">
          <button class="icon-btn" title="Live Edit" onclick="event.stopPropagation(); sidebar.liveEdit('${s.id}')">⚡</button>
          <button class="icon-btn" title="Edit" onclick="event.stopPropagation(); sidebar.editSpec('${s.id}')">✏️</button>
          <button class="icon-btn delete" title="Delete" onclick="event.stopPropagation(); sidebar.deleteSpec('${s.id}')">🗑</button>
        </span>
      </div>
    `).join('');
  }

  selectSpec(id) {
    if (this.onSelectCallback) {
      this.onSelectCallback(id);
    }
  }

  editSpec(id) {
    if (this.onEditCallback) {
      this.onEditCallback(id);
    }
  }

  liveEdit(id) {
    if (this.onLiveEditCallback) {
      this.onLiveEditCallback(id);
    }
  }

  deleteSpec(id) {
    if (this.onDeleteCallback) {
      this.onDeleteCallback(id);
    }
  }

  escHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

const sidebar = new Sidebar();
