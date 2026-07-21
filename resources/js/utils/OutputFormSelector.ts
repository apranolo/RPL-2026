export type OutputType = 'Jurnal' | 'Buku' | 'HKI' | 'Produk';

export interface OutputFormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'url' | 'textarea';
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
}

export const OUTPUT_FORM_FIELDS: Record<OutputType, OutputFormField[]> = {
  Jurnal: [
    { name: 'doi', label: 'DOI', type: 'text', placeholder: '10.xxxx/xxxxx', maxLength: 255 },
    { name: 'journal_name', label: 'Nama Jurnal', type: 'text', placeholder: 'Nama jurnal', required: true, maxLength: 255 },
    { name: 'volume', label: 'Volume', type: 'text', placeholder: 'Vol. 10', maxLength: 50 },
    { name: 'number', label: 'Nomor', type: 'text', placeholder: 'No. 2', maxLength: 50 },
    { name: 'url', label: 'URL Publikasi', type: 'url', placeholder: 'https://jurnal.example.com', maxLength: 255 },
  ],
  Buku: [
    { name: 'isbn', label: 'ISBN', type: 'text', placeholder: '978-xxxx-xxxx-x', maxLength: 50 },
    { name: 'publisher', label: 'Penerbit', type: 'text', placeholder: 'Nama penerbit', required: true, maxLength: 255 },
    { name: 'pages', label: 'Jumlah Halaman', type: 'number', placeholder: '250', maxLength: 50 },
    { name: 'tipe_buku', label: 'Tipe Buku', type: 'text', placeholder: 'Buku Ajar / Monograf / Modul', maxLength: 100 },
  ],
  HKI: [
    { name: 'patent_number', label: 'Nomor Paten/HKI', type: 'text', placeholder: 'IDXXXXXXXX / WXX/XXXX/XXXX', required: true, maxLength: 100 },
    { name: 'patent_type', label: 'Jenis HKI', type: 'text', placeholder: 'Paten / Merek / Desain Industri / Hak Cipta', required: true, maxLength: 100 },
    { name: 'inventors', label: 'Pencipta/Pemegang', type: 'text', placeholder: 'Nama pencipta/pemegang HKI', required: true, maxLength: 255 },
  ],
  Produk: [
    { name: 'partner_institution', label: 'Institusi Mitra', type: 'text', placeholder: 'Nama institusi mitra', maxLength: 255 },
    { name: 'benefits_description', label: 'Deskripsi Manfaat', type: 'textarea', placeholder: 'Deskripsi manfaat produk/prototipe', maxLength: 1000 },
  ],
};

export const OUTPUT_TYPE_LABELS: Record<OutputType, string> = {
  Jurnal: 'Jurnal Ilmiah',
  Buku: 'Buku / Modul',
  HKI: 'HKI / Paten',
  Produk: 'Produk / Prototipe',
};

export function getOutputFormFields(type: OutputType): OutputFormField[] {
  return OUTPUT_FORM_FIELDS[type] ?? [];
}

export function getOutputTypeLabel(type: OutputType): string {
  return OUTPUT_TYPE_LABELS[type] ?? type;
}

export function isValidOutputType(type: string): type is OutputType {
  return type in OUTPUT_FORM_FIELDS;
}

export interface OutputFormData {
  doi?: string;
  journal_name?: string;
  volume?: string;
  number?: string;
  url?: string;
  isbn?: string;
  publisher?: string;
  pages?: string;
  tipe_buku?: string;
  patent_number?: string;
  patent_type?: string;
  inventors?: string;
  partner_institution?: string;
  benefits_description?: string;
  [key: string]: string | undefined;
}

export function getEmptyOutputFormData(type: OutputType): OutputFormData {
  const fields = getOutputFormFields(type);
  return fields.reduce((acc, field) => {
    acc[field.name] = '';
    return acc;
  }, {} as OutputFormData);
}

export function filterOutputFormData(data: OutputFormData, type: OutputType): OutputFormData {
  const validFields = getOutputFormFields(type).map((f) => f.name);
  const filtered: OutputFormData = {};
  for (const key of validFields) {
    if (data[key] !== undefined && data[key] !== '') {
      filtered[key] = data[key];
    }
  }
  return filtered;
}

export interface OutputFormComponentProps {
  type: OutputType;
  data: OutputFormData;
  onChange: (field: string, value: string) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export type OutputFormComponentType = React.ComponentType<OutputFormComponentProps>;