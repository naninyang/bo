import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import styles from '@/styles/Home.module.sass';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

interface Props {
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  labelKey: string;
}

export default function ChartView({ data, xKey, yKey, labelKey }: Props) {
  const chartData = {
    labels: data.map((item) => String(item[xKey])),
    datasets: [
      {
        label: labelKey ? String(data[0][labelKey]) : yKey,
        data: data.map((item) => (typeof item[yKey] === 'number' ? item[yKey] : 0)),
        backgroundColor: 'rgba(253, 140, 115, 0.2)',
        borderColor: 'rgba(253, 140, 115, 0.7)',
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${xKey} vs ${yKey}`,
      },
    },
  };

  return (
    <div className={styles.charts}>
      <section className={styles.section}>
        <div className={styles.module}>
          <h2>Chart View: Bar</h2>
          <Bar options={options} data={chartData} />
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.module}>
          <h2>Chart View: Line</h2>
          <Line options={options} data={chartData} />
        </div>
      </section>
    </div>
  );
}
