/**
 * BarChart Component
 *
 * @description
 * Grafik batang interaktif untuk visualisasi serapan dana tahunan.
 *
 * @author JurnalMU Team
 * @filepath /resources/js/components/Charts/BarChart.tsx
 */

import React from 'react';
import Chart from 'react-apexcharts';

interface BarChartProps {
    data: { year: number; amount: number }[];
}

export default function BarChart({ data }: BarChartProps) {
    const options = {
        chart: {
            id: 'funding-bar-chart',
            toolbar: {
                show: false
            },
            fontFamily: 'inherit',
            background: 'transparent'
        },
        xaxis: {
            categories: data.map(item => item.year.toString()),
            title: {
                text: 'Tahun'
            }
        },
        yaxis: {
            title: {
                text: 'Total Pendanaan (Rp)'
            },
            labels: {
                formatter: (value: number) => {
                    return new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0
                    }).format(value);
                }
            }
        },
        colors: ['#3b82f6'],
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: false,
                columnWidth: '55%',
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
        },
        fill: {
            opacity: 1
        },
        tooltip: {
            y: {
                formatter: function (val: number) {
                    return new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0
                    }).format(val);
                }
            }
        }
    };

    const series = [
        {
            name: 'Total Pendanaan',
            data: data.map(item => item.amount)
        }
    ];

    return (
        <div className="w-full">
            <Chart options={options} series={series} type="bar" height={350} />
        </div>
    );
}
