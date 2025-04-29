import { useState, useEffect } from 'react';
import RippleButton from './RippleButton';
import styles from '@/styles/All.module.sass';

type Props = {
  headers: { key: string; value: string }[];
  onChange: (updated: { key: string; value: string }[]) => void;
  onDuplicate?: (isDuplicate: boolean) => void;
};

export function Headers({ headers, onChange, onDuplicate }: Props) {
  const [duplicateKey, setDuplicateKey] = useState<string | null>(null);

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...headers];
    updated[index][field] = value;
    onChange(updated);
  };

  const addHeader = () => onChange([...headers, { key: '', value: '' }]);

  const removeHeader = (index: number) => {
    const updated = headers.filter((_, i) => i !== index);
    onChange(updated);
  };

  useEffect(() => {
    const keys = headers.map((h) => h.key).filter((key) => key.trim() !== '');
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
    const found = duplicates[0] ?? null;
    setDuplicateKey(found);
    if (onDuplicate) onDuplicate(!!found);
  }, [headers, onDuplicate]);

  return (
    <div className={styles.component}>
      <h3>Headers</h3>
      <div className={styles.list}>
        <div className={styles.term} aria-hidden>
          <span>Key</span>
          <span>Value</span>
        </div>
        <div className={styles.desc}>
          {headers.map((header, index) => (
            <div key={index}>
              <div className={styles.value}>
                <input
                  type="text"
                  placeholder="Key"
                  value={header.key}
                  onChange={(e) => updateHeader(index, 'key', e.target.value)}
                />
              </div>
              <div className={styles.value}>
                <input
                  type="text"
                  placeholder="Value"
                  value={header.value}
                  onChange={(e) => updateHeader(index, 'value', e.target.value)}
                />
              </div>
              <div className={styles.remove}>
                <RippleButton type="button" onClick={() => removeHeader(index)}>
                  <span>제거</span>
                </RippleButton>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.add}>
          <div className={styles.dummy} aria-hidden>
            <span>Key</span>
            <span>Value</span>
          </div>
          <button type="button" onClick={addHeader}>
            <span>Header 추가</span>
          </button>
        </div>
      </div>

      {duplicateKey && (
        <p>
          중복된 key가 있습니다. <strong>({duplicateKey})</strong>
        </p>
      )}
    </div>
  );
}
