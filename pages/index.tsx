import { useState } from 'react';
import JsonValidator from '@/components/JsonValidator';
import TableView from '@/components/TableView';
import styles from '@/styles/Home.module.sass';

export default function Home() {
  const [jsonData, setJsonData] = useState<Record<string, any>[] | null>(null);

  return (
    <main className={styles.main}>
      <JsonValidator onValidData={setJsonData} />
      {jsonData && (
        <div className="result">
          <TableView data={jsonData} />
        </div>
      )}
      <div className={styles.notice}>
        <p>
          현재는 <strong>테이블뷰</strong>만 지원합니다.
        </p>
        <p>
          <strong>차트뷰</strong>는 개발 중입니다!
        </p>
      </div>
    </main>
  );
}
