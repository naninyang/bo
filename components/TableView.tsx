import styles from '@/styles/Home.module.sass';

type Props = {
  data: Record<string, any>[];
};

export default function TableView({ data }: Props) {
  const headers = Object.keys(data[0]);

  return (
    <section className={styles.section}>
      <div className={styles.module}>
        <h2>Table View</h2>
        {data.length ? (
          <div className={styles.table}>
            <table>
              <thead>
                <tr>
                  {headers.map((key) => (
                    <th key={key} scope="col">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx}>
                    {headers.map((key) => (
                      <td key={key}>{typeof row[key] === 'object' ? JSON.stringify(row[key]) : row[key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>테이터가 없습니다</p>
        )}
      </div>
    </section>
  );
}
