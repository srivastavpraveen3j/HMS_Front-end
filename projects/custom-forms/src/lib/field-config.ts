export interface FieldConfig {
  name: string;  // control name
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox';
  label?: string;
  value?: any;
  validators?: any[];
  options?: { key: string, value: string }[];
}
