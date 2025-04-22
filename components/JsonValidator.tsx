import { useState, FormEvent, useEffect } from 'react';
import { FlatJsonObject } from '@/types';
import RippleButton from './RippleButton';
import styles from '@/styles/Home.module.sass';

type Props = {
  onValidData: (data: FlatJsonObject[] | null, status: 'loading' | 'success' | 'error') => void;
};

type AuthType = 'none' | 'basic' | 'bearer' | 'apikey' | 'notion';

export default function JsonValidator({ onValidData }: Props) {
  const [authType, setAuthType] = useState<AuthType>('none');

  const [apiUrl, setApiUrl] = useState('');
  const [apiUrlPlaceholder, setApiUrlPlaceholder] = useState('http:// 또는 https:// 로 시작하는 API 엔드포인트 주소');
  const [apiUrlDisabled, setApiUrlDisabled] = useState(false);

  const [basicUsername, setBasicUsername] = useState('');
  const [basicPassword, setBasicPassword] = useState('');
  const [bearerToken, setBearerToken] = useState('');
  const [apiKeyName, setApiKeyName] = useState('');
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [apiAddTo, setApiAddTo] = useState<'header' | 'query'>('header');

  const [notionSecret, setNotionSecret] = useState('');
  const [notionDbId, setNotionDbId] = useState('');

  const [error, setError] = useState('');

  useEffect(() => {
    if (authType === 'notion') {
      setApiUrl('');
      setApiUrlDisabled(true);
      setApiUrlPlaceholder('Notion Database가 선택됨');
    } else {
      setApiUrlDisabled(false);
      setApiUrlPlaceholder('http:// 또는 https:// 로 시작하는 API 엔드포인트 주소');
    }
  }, [authType]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    onValidData(null, 'loading');

    try {
      const headers: HeadersInit = {
        ...(authType === 'basic' && {
          Authorization: `Basic ${btoa(`${basicUsername}:${basicPassword}`)}`,
        }),
        ...(authType === 'bearer' && {
          Authorization: `Bearer ${bearerToken}`,
        }),
        ...(authType === 'apikey' &&
          apiAddTo === 'header' && {
            [apiKeyName]: apiKeyValue,
          }),
      };

      const isNotion = authType === 'notion';

      const urlWithQuery =
        authType === 'apikey' && apiAddTo === 'query'
          ? `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}${encodeURIComponent(apiKeyName)}=${encodeURIComponent(apiKeyValue)}`
          : apiUrl;

      const proxyUrl = isNotion
        ? `/api/proxy?url=notion&secret=${encodeURIComponent(notionSecret)}&databaseId=${encodeURIComponent(notionDbId)}`
        : `/api/proxy?url=${encodeURIComponent(urlWithQuery)}`;

      const response = await fetch(proxyUrl, { headers });

      if (!response.ok) {
        setError('API 엔드포인트가 존재하지 않거나 접근이 거부되었습니다.');
        onValidData(null, 'error');
        return;
      }

      const json = await response.json();

      if (!Array.isArray(json)) {
        setError('JSON 데이터는 배열 형태의 객체 집합이어야 합니다.');
        onValidData(null, 'error');
        return;
      }

      const allKeys = new Set<string>();
      for (const item of json) {
        if (typeof item !== 'object' || item === null || Array.isArray(item)) {
          setError('JSON 항목은 반드시 객체여야 합니다.');
          onValidData(null, 'error');
          return;
        }
        Object.keys(item).forEach((key) => allKeys.add(key));
      }

      const hasInconsistentKeys = json.some((item) => [...allKeys].some((key) => !(key in item)));
      if (hasInconsistentKeys) {
        setError('일부 항목에 누락된 key가 있어 JSON 구조가 일관되지 않습니다.');
        onValidData(null, 'error');
        return;
      }

      onValidData(json, 'success');
    } catch (err) {
      setError('API 엔드포인트가 JSON이 아니거나 JSON 코드에 문제가 있습니다. 확인하세요.');
      console.error(err);
      onValidData(null, 'error');
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.module}>
        <h2>엔드포인트 정보</h2>
        <form onSubmit={handleSubmit}>
          <fieldset>
            <legend>엔드포인트 정보 입력폼</legend>
            <div className={styles.group}>
              <label htmlFor="api-url">API URL</label>
              <div className={styles.value}>
                <input
                  id="api-url"
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder={apiUrlPlaceholder}
                  disabled={apiUrlDisabled}
                  required
                />
              </div>
            </div>
            <div className={styles.group}>
              <label htmlFor="auth-type">Auth Type</label>
              <div className={styles.value}>
                <select id="auth-type" value={authType} onChange={(e) => setAuthType(e.target.value as AuthType)}>
                  <option value="none">No Auth</option>
                  <option value="basic">Basic Auth</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="apikey">API Key</option>
                  <option value="notion">Notion Database API</option>
                </select>
              </div>
            </div>
            {authType === 'basic' && (
              <div className={styles.groups}>
                <div className={styles.group}>
                  <label htmlFor="username">Username</label>
                  <div className={styles.value}>
                    <input
                      id="username"
                      type="text"
                      value={basicUsername}
                      onChange={(e) => setBasicUsername(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.group}>
                  <label htmlFor="password">Password</label>
                  <div className={styles.value}>
                    <input
                      id="password"
                      type="password"
                      value={basicPassword}
                      onChange={(e) => setBasicPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
            {authType === 'bearer' && (
              <div className={styles.group}>
                <label htmlFor="token">Token</label>
                <div className={styles.value}>
                  <input id="token" type="text" value={bearerToken} onChange={(e) => setBearerToken(e.target.value)} />
                </div>
              </div>
            )}
            {authType === 'apikey' && (
              <div className={styles.groups}>
                <div className={styles.group}>
                  <label htmlFor="api-key">Key</label>
                  <div className={styles.value}>
                    <input
                      id="api-key"
                      type="text"
                      value={apiKeyName}
                      onChange={(e) => setApiKeyName(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.group}>
                  <label htmlFor="api-value">Value</label>
                  <div className={styles.value}>
                    <input
                      id="api-value"
                      type="text"
                      value={apiKeyValue}
                      onChange={(e) => setApiKeyValue(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.group}>
                  <label htmlFor="api-add-to">Add to</label>
                  <div className={styles.value}>
                    <select
                      id="api-add-to"
                      value={apiAddTo}
                      onChange={(e) => setApiAddTo(e.target.value as 'header' | 'query')}
                    >
                      <option value="header">Header</option>
                      <option value="query">Query Params</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            {authType === 'notion' && (
              <div className={styles.groups}>
                <div className={styles.group}>
                  <label htmlFor="notion-token">Secret Token</label>
                  <div className={styles.value}>
                    <input
                      id="notion-token"
                      type="text"
                      value={notionSecret}
                      onChange={(e) => setNotionSecret(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.group}>
                  <label htmlFor="notion-db">Database ID</label>
                  <div className={styles.value}>
                    <input
                      id="notion-db"
                      type="text"
                      value={notionDbId}
                      onChange={(e) => setNotionDbId(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
            {error && <p>{error}</p>}
            <div className={styles.submit}>
              <RippleButton type="submit">데이터 보기</RippleButton>
            </div>
          </fieldset>
        </form>
      </div>
    </section>
  );
}
