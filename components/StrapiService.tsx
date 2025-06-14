import { useState, useEffect } from 'react';
import styles from '@/styles/All.module.sass';
import { Checked, Unchecked } from './Svgs';

interface Props {
  onChange: (url: string, token: string, version: 'v4' | 'v5', pageSize: string) => void;
}

export default function StrapiService({ onChange }: Props) {
  const [strapiBaseUrl, setStrapiBaseUrl] = useState('');
  const [token, setToken] = useState('');
  const [version, setVersion] = useState<'v4' | 'v5'>('v4');
  const [collectionName, setCollectionName] = useState('');
  const [pageSize, setPageSize] = useState('');

  useEffect(() => {
    if (!strapiBaseUrl || !token || !collectionName) return;
    const pluralApiId = `${collectionName}s`;
    const url = `${strapiBaseUrl}/api/${pluralApiId}`;
    onChange(url, token, version, pageSize);
  }, [strapiBaseUrl, token, version, collectionName, pageSize, onChange]);

  const [isHidden, setIsHidden] = useState(false);

  return (
    <div className={styles.component}>
      <h3>Strapi CMS API</h3>
      <div className={styles.groups}>
        <div className={styles.group}>
          <label htmlFor="strapi-url">URL</label>
          <div className={styles.value}>
            <input
              type="text"
              id="strapi-url"
              placeholder="e.g.) https://cms.example.com"
              value={strapiBaseUrl}
              onChange={(event) => setStrapiBaseUrl(event.target.value)}
              required
            />
          </div>
        </div>
        <div className={styles.group}>
          <label htmlFor="collection-name">Collection Name</label>
          <div className={styles.value}>
            <input
              type="text"
              id="collection-name"
              placeholder="단수형으로 입력"
              value={collectionName}
              onChange={(event) => setCollectionName(event.target.value)}
              required
            />
          </div>
        </div>
      </div>
      <div className={styles.group}>
        <label htmlFor="strapi-token">Bearer Token</label>
        <div className={styles.value}>
          <input
            type="text"
            inputMode={isHidden ? 'text' : undefined}
            id="strapi-token"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            autoComplete={isHidden ? 'on' : 'off'}
            required
          />
        </div>
        <button type="button" onClick={() => setIsHidden(!isHidden)} className={isHidden ? styles.isHidden : ''}>
          {isHidden ? '보기' : '숨기기'}
        </button>
      </div>
      <div className={styles.groups}>
        <div className={styles.group}>
          <span>Strapi Version</span>
          <div className={styles.checkboxes}>
            <div className={styles.checkbox}>
              <input
                type="radio"
                id="strapi-version-v4"
                name="strapi-version"
                value="v4"
                checked={version === 'v4'}
                onChange={() => setVersion('v4')}
              />
              {version === 'v4' ? (
                <div className={styles.checked}>
                  <Checked />
                </div>
              ) : (
                <div className={styles.unchecked}>
                  <Unchecked />
                </div>
              )}
              <label htmlFor="strapi-version-v4">v4</label>
            </div>
            <div className={styles.checkbox}>
              <input
                type="radio"
                id="strapi-version-v5"
                name="strapi-version"
                value="v5"
                checked={version === 'v5'}
                onChange={() => setVersion('v5')}
              />
              {version === 'v5' ? (
                <div className={styles.checked}>
                  <Checked />
                </div>
              ) : (
                <div className={styles.unchecked}>
                  <Unchecked />
                </div>
              )}
              <label htmlFor="strapi-version-v5">v5</label>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.group}>
        <label htmlFor="strapi-page-size">페이지 옵션</label>
        <div className={styles.value}>
          <input
            type="text"
            id="strapi-page-size"
            placeholder="Page size value (최대 100)"
            value={pageSize}
            onChange={(event) => {
              setPageSize(event.target.value);
            }}
          />
        </div>
      </div>
    </div>
  );
}
