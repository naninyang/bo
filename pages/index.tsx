import { useState } from 'react';
import { FlatJsonObject } from '@/types';
import Seo from '@/components/Seo';
import JsonValidator from '@/components/JsonValidator';
import TableView from '@/components/TableView';
import styles from '@/styles/Home.module.sass';

export default function Home() {
  const [jsonData, setJsonData] = useState<FlatJsonObject[] | null>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | null>(null);

  const handleValidData = (data: FlatJsonObject[] | null, status: 'loading' | 'success' | 'error') => {
    setJsonData(data);
    setStatus(status);
  };

  const timestamp = Date.now();

  return (
    <main className={styles.main}>
      <Seo
        pageDescription="하나의 JSON으로 테이블과 차트를 볼 수 있어요!"
        pageImg={`https://bo.dev1stud.io/images/og.webp?ts=${timestamp}`}
      />
      <div className={styles.container}>
        <ul className={styles.announcement}>
          <li>
            현재는 <strong>테이블뷰</strong>만 지원합니다.
          </li>
          <li>
            <strong>차트뷰</strong>는 개발 중입니다!
          </li>
          <li>
            JSON 속성명(field name) 및 속성값(field value)은 <strong>Raw Text 형태</strong>로 표시됩니다.
          </li>
          <li>Notion Database API를 사용하실 수 있습니다.</li>
          <li>입력하신 엔드포인트 정보는 서버에 저장되지 않습니다.</li>
          <li>일트보자 웹서비스는 데이터베이스와 관련된 일체의 서버를 운용하지 않습니다.</li>
          <li className={styles.warning}>
            Auth Type을 선택하여 사용하는 경우 인증 정보가 Evil Twin Attack, Session Hijacking, DNS Spoofing / DNS
            Hijacking 등의 사유로 탈취당할 수 있습니다.{' '}
            <strong>
              인증 정보 입력시에는 VPN을 사용하시거나 스마트폰을 이용한 테더링, 핫스팟을 사용하시는 것을 추천드립니다.
            </strong>
          </li>
          <li className={styles.warning}>
            인증 정보 입력시에는 항상 뒤를 조심하세요. 후방주의를 게을리했을 때 Shoulder Surfing 위험이 있습니다.{' '}
            <strong>귀신보다 사람이 더 무섭습니다.</strong>
          </li>
        </ul>
        <JsonValidator onValidData={handleValidData} />
        {status === 'loading' && (
          <section className={styles.section}>
            <div className={styles.module}>
              <p>불러오는 중입니다...</p>
            </div>
          </section>
        )}
        {status === 'error' && (
          <section className={styles.section}>
            <div className={styles.module}>
              <p>데이터를 불러오지 못했습니다.</p>
            </div>
          </section>
        )}
        {status === 'success' && jsonData && <TableView data={jsonData} />}
      </div>
    </main>
  );
}
