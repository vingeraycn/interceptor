interface ValidationReport {
  valid: true;
  results: [];
}

export class StaticConfigLoader {}

export class HtmlValidate {
  validateString(_code: string): Promise<ValidationReport> {
    return Promise.resolve({ valid: true, results: [] });
  }
}
