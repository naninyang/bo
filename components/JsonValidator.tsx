import { useState, FormEvent } from 'react';
import styles from '@/styles/Home.module.sass';

type Props = {
  onValidData: (data: Record<string, any>[]) => void;
};

export default function JsonValidator({ onValidData }: Props) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);

      if (!response.ok) {
        setError('API 엔드포인트가 존재하지 않거나 접근이 거부되었습니다.');
        return;
      }

      const json = await response.json();

      if (!Array.isArray(json)) {
        setError('JSON 데이터는 배열 형태의 객체 집합이어야 합니다.');
        return;
      }

      const allKeys = new Set<string>();
      for (const item of json) {
        if (typeof item !== 'object' || item === null || Array.isArray(item)) {
          setError('JSON 항목은 반드시 객체여야 합니다.');
          return;
        }
        Object.keys(item).forEach((key) => allKeys.add(key));
      }

      for (const item of json) {
        for (const key of allKeys) {
          if (!(key in item)) {
            setError('일부 항목에 누락된 key가 있어 JSON 구조가 일관되지 않습니다.');
            return;
          }
        }
      }

      onValidData(json);
    } catch (err) {
      setError('API 엔드포인트가 JSON이 아니거나 JSON 코드에 문제가 있습니다. 확인하세요.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <fieldset>
        <label htmlFor="api-url">API Endpoint URL</label>
        <input
          id="api-url"
          type="text"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="http:// 또는 https:// 로 시작하는 API 엔드포인트 주소"
          required
        />
        {error && <p>{error}</p>}
        <button type="submit">데이터 보기</button>
      </fieldset>
    </form>
  );
}
