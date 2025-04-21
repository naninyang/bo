import styles from '@/styles/Home.module.sass';

type Props = {
  data: Record<string, any>[];
};

export default function TableView({ data }: Props) {
  const headers = Object.keys(data[0]);

  return (
    <>
      {data.length ? (
        <table className={styles.table}>
          <thead>
            <tr>
              {headers.map((key) => (
                <th key={key}>{key}</th>
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
      ) : (
        <p>테이터가 없습니다</p>
      )}
    </>
  );
}
