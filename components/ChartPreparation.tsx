import { useState, useMemo, FormEvent } from 'react';
import styles from '@/styles/Home.module.sass';
import RippleButton from './RippleButton';

interface Props {
  data: Record<string, unknown>[];
  onSubmit: (xKey: string, yKey: string, labelKey: string) => void;
}

export default function ChartPreparation({ data, onSubmit }: Props) {
  const [xKey, setXKey] = useState('');
  const [yKey, setYKey] = useState('');
  const [labelKey, setLabelKey] = useState('');

  const allKeys = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter((key) => key !== 'id');
  }, [data]);

  const numericKeys = useMemo(() => {
    return allKeys.filter((key) => {
      if (key === 'id') return false;
      return data.every((item) => typeof item[key] === 'number');
    });
  }, [allKeys, data]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (xKey && yKey) {
      onSubmit(xKey, yKey, labelKey);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.module}>
        <h2>차트 생성하기 사전작업</h2>
        {numericKeys.length > 0 ? (
          <form onSubmit={handleSubmit}>
            <fieldset>
              <legend>차트 항목 입력폼</legend>
              <div className={styles.group}>
                <label htmlFor="xKey">X축 항목</label>
                <select id="xKey" value={xKey} onChange={(e) => setXKey(e.target.value)}>
                  <option value="">선택하세요</option>
                  {allKeys.map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.group}>
                <label htmlFor="yKey">Y축 항목</label>
                <select id="yKey" value={yKey} onChange={(event) => setYKey(event.target.value)}>
                  <option value="">선택하세요</option>
                  {numericKeys.map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.group}>
                <label htmlFor="labelKey">라벨 항목</label>
                <select id="labelKey" value={labelKey} onChange={(e) => setLabelKey(e.target.value)}>
                  <option value="">선택하세요 (필수아님)</option>
                  {allKeys.map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.submit}>
                <RippleButton type="submit">차트 보기</RippleButton>
              </div>
            </fieldset>
          </form>
        ) : (
          <p>숫자형 항목이 없습니다. 차트를 만들 수 없습니다.</p>
        )}
      </div>
    </section>
  );
}
