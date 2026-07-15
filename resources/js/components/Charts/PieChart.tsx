/**
 * PieChart Component
 *
 * @description
 * An interactive donut/pie chart to show proposal distribution by scientific field.
 *
 * @author JurnalMU Team
 * @filepath /resources/js/components/Charts/PieChart.tsx
 */

import React from 'react';
import Chart from 'react-apexcharts';

interface PieChartProps {
    data: { name: string; value: number }[];
}

export default function PieChart({ data }: PieChartProps) {
    const options = {
        chart: {
            id: 'proposal-pie-chart',
            fontFamily: 'inherit',
            background: 'transparent',
            toolbar: {
                show: false
            }
        },
        labels: data.map(item => item.name),
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'],
        stroke: {
            show: false
        },
        dataLabels: {
            enabled: true,
            dropShadow: {
                enabled: false
            }
        },
        theme: {
            mode: 'light' as const
        },
        legend: {
            position: 'bottom' as const,
            fontSize: '13px',
            labels: {
                colors: 'inherit'
            }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%'
                }
            }
        }
    };

    const series = data.map(item => item.value);

    return (
        <div className="w-full">
            <Chart options={options} series={series} type="donut" height={350} />
        </div>
    );
}
