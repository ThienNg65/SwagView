// Storage management for specs
const STORAGE_KEY = 'swagger_specs';

class SpecStorage {
  static loadSpecs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  static saveSpecs(specs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(specs));
  }

  static addSpec(name, yaml) {
    const specs = this.loadSpecs();
    const id = crypto.randomUUID();
    specs.push({ id, name, yaml });
    this.saveSpecs(specs);
    return id;
  }

  static updateSpec(id, name, yaml) {
    const specs = this.loadSpecs();
    const spec = specs.find(s => s.id === id);
    if (spec) {
      spec.name = name;
      spec.yaml = yaml;
      this.saveSpecs(specs);
    }
  }

  static deleteSpec(id) {
    const specs = this.loadSpecs();
    this.saveSpecs(specs.filter(s => s.id !== id));
  }

  static getSpec(id) {
    const specs = this.loadSpecs();
    return specs.find(s => s.id === id);
  }
}
