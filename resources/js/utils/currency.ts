/** @author KHANSA KAMILAH LICTJELITA */
export const formatRp = (value: number | string, showSymbol: boolean = true): string => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numericValue)) {
        return showSymbol ? 'Rp 0' : '0';
    }

    const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numericValue);

    return showSymbol ? formatted : formatted.replace(/^Rp\s?/, '');
};
