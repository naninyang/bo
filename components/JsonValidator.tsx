import { useState, FormEvent, useEffect } from 'react';
import { get } from 'lodash';
import { FlatJsonObject, FlatJsonStatus } from '@/types';
import RippleButton from './RippleButton';
import styles from '@/styles/Home.module.sass';
import { Checked, Unchecked } from './Svgs';

type Props = {
  onValidData: (data: FlatJsonObject[] | null, status: FlatJsonStatus) => void;
};

type InputType = (typeof inputTypes)[number];

const inputTypes = ['url', 'json'] as const;

type AuthType = 'none' | 'basic' | 'bearer' | 'apikey' | 'notion';
export default function JsonValidator({ onValidData }: Props) {
  const [inputType, setInputType] = useState<InputType>('url');

  const [authType, setAuthType] = useState<AuthType>('none');

  const [inputFormat, setInputFormat] = useState<'advanced' | 'tsv' | 'csv'>('advanced');

  const [tsvText, setTsvText] = useState('');
  const [csvText, setCsvText] = useState('');

  const [jsonText, setJsonText] = useState('');

  const [apiUrl, setApiUrl] = useState('');
  const [apiUrlPlaceholder, setApiUrlPlaceholder] = useState('API 엔드포인트 주소');
  const [apiUrlDisabled, setApiUrlDisabled] = useState(false);

  const [basicUsername, setBasicUsername] = useState('');
  const [basicPassword, setBasicPassword] = useState('');
  const [bearerToken, setBearerToken] = useState('');
  const [apiKeyName, setApiKeyName] = useState('');
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [apiAddTo, setApiAddTo] = useState<'header' | 'query'>('header');

  const [notionSecret, setNotionSecret] = useState('');
  const [notionDbId, setNotionDbId] = useState('');

  const [jsonRaw, setJsonRaw] = useState<unknown>(null);
  const [isJsonValid, setIsJsonValid] = useState(false);
  const [jsonPath, setJsonPath] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (authType === 'notion') {
      setApiUrl('');
      setApiUrlDisabled(true);
      setApiUrlPlaceholder('Notion Database API가 선택됨');
    } else {
      setApiUrlDisabled(false);
      setApiUrlPlaceholder('API 엔드포인트 주소');
    }
  }, [authType]);

  const handleDelimitedSubmit = (text: string, delimiter: string) => {
    try {
      const parseValue = (value: string): string | number | boolean => {
        if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
        return value;
      };

      const lines = text.trim().split(/\r?\n/);
      const headers = lines[0].split(delimiter);

      const data: FlatJsonObject[] = lines.slice(1).map((line, i) => {
        const cells = line.split(delimiter);
        if (cells.length !== headers.length) throw new Error(`Row ${i + 2} has mismatched cells`);

        const row: FlatJsonObject = {};
        headers.forEach((header, index) => {
          row[header] = parseValue(cells[index]);
        });
        return row;
      });

      onValidData(data, 'success');
    } catch (event) {
      console.error('파싱 오류:', event);
      setError('JSON으로 파싱에 실패했습니다');
      onValidData(null, 'error');
    }
  };

  const handleTsvSubmit = () => {
    try {
      const parseValue = (value: string): string | number | boolean => {
        if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
        return value;
      };

      const lines = tsvText.trim().split(/\r?\n/);
      const headers = lines[0].split('\t');

      const data: FlatJsonObject[] = lines.slice(1).map((line, i) => {
        const cells = line.split('\t');

        if (cells.length !== headers.length) {
          console.warn(`셀 수 불일치: ${cells.length} vs ${headers.length}`);
          throw new Error(`Row ${i + 2} has mismatched cells`);
        }

        const row: FlatJsonObject = {};
        headers.forEach((header, index) => {
          const raw = cells[index];
          const parsed = parseValue(raw);
          row[header] = parsed;
        });

        return row;
      });

      onValidData(data, 'success');
    } catch (event) {
      console.error('파싱 오류:', event);
      setError('JSON으로 파싱에 실패했습니다 (줄바꿈이 셀 내부에 들어간 경우, 불완전한 인코딩 등)');
      onValidData(null, 'error');
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    onValidData(null, 'loading');
    setIsJsonValid(false);
    setJsonRaw(null);

    if (inputFormat === 'tsv') {
      handleTsvSubmit();
      return;
    }

    if (inputFormat === 'csv') {
      handleDelimitedSubmit(csvText, ',');
      return;
    }

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

      if (inputType === 'json') {
        const parsed = JSON.parse(jsonText);
        console.log('📦 JSON 파싱 결과:', parsed); // 추가

        setJsonRaw(parsed);
        setIsJsonValid(true);

        if (jsonPath.trim()) {
          const target = get(parsed, jsonPath.trim());
          console.log('🔎 JSON 경로 적용 후 결과:', target); // 추가

          if (!Array.isArray(target)) {
            setError('입력한 경로에 해당하는 값이 배열이 아닙니다.');
            onValidData(null, 'error');
            return;
          }
          onValidData(target, 'success');
        } else if (Array.isArray(parsed)) {
          onValidData(parsed, 'success');
        } else {
          setError('최상위 JSON이 배열이 아닙니다. 배열 경로를 입력해 주세요.');
          onValidData(null, 'error');
        }
        return;
      }

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

      if (typeof json !== 'object' || json === null) {
        setError('JSON 구조가 올바르지 않습니다.');
        onValidData(null, 'error');
        return;
      }

      setJsonRaw(json);
      setIsJsonValid(true);

      if (jsonPath.trim()) {
        const target = get(json, jsonPath.trim());

        if (!Array.isArray(target)) {
          setError('입력한 경로에 해당하는 값이 배열이 아닙니다.');
          onValidData(null, 'error');
          return;
        }

        const allKeys = new Set<string>();
        for (const item of target) {
          if (typeof item !== 'object' || item === null || Array.isArray(item)) {
            setError('배열의 각 항목은 객체여야 합니다.');
            onValidData(null, 'error');
            return;
          }
          Object.keys(item).forEach((key) => allKeys.add(key));
        }

        const hasInconsistentKeys = target.some((item) => [...allKeys].some((key) => !(key in item)));
        if (hasInconsistentKeys) {
          setError('일부 항목에 누락된 key가 있어 JSON 구조가 일관되지 않습니다.');
          onValidData(null, 'error');
          return;
        }

        onValidData(target, 'success');
        return;
      }

      if (Array.isArray(json)) {
        onValidData(json, 'success');
        return;
      }

      setError('최상위 JSON이 배열이 아닙니다. 배열경로를 입력해 주세요.');
      onValidData(null, 'error');
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
              <span>입력 포맷</span>
              <div className={styles.checkboxes}>
                <div className={styles.checkbox}>
                  <input
                    id="format-advanced"
                    type="radio"
                    name="inputFormat"
                    value="advanced"
                    checked={inputFormat === 'advanced'}
                    onChange={() => {
                      setInputFormat('advanced');
                      setIsJsonValid(false);
                      setError('');
                      onValidData(null, null);
                    }}
                  />
                  {inputFormat === 'advanced' ? (
                    <div className={styles.checked}>
                      <Checked />
                    </div>
                  ) : (
                    <div className={styles.unchecked}>
                      <Unchecked />
                    </div>
                  )}
                  <label htmlFor="format-advanced">Advanced</label>
                </div>
                <div className={styles.checkbox}>
                  <input
                    id="format-tsv"
                    type="radio"
                    name="inputFormat"
                    value="tsv"
                    checked={inputFormat === 'tsv'}
                    onChange={() => {
                      setInputFormat('tsv');
                      setIsJsonValid(false);
                      setError('');
                      onValidData(null, null);
                    }}
                  />
                  {inputFormat === 'tsv' ? (
                    <div className={styles.checked}>
                      <Checked />
                    </div>
                  ) : (
                    <div className={styles.unchecked}>
                      <Unchecked />
                    </div>
                  )}
                  <label htmlFor="format-tsv">TSV</label>
                </div>
                <div className={styles.checkbox}>
                  <input
                    id="format-csv"
                    type="radio"
                    name="inputFormat"
                    value="csv"
                    checked={inputFormat === 'csv'}
                    onChange={() => {
                      setInputFormat('csv');
                      setIsJsonValid(false);
                      setError('');
                      onValidData(null, null);
                    }}
                  />
                  {inputFormat === 'csv' ? (
                    <div className={styles.checked}>
                      <Checked />
                    </div>
                  ) : (
                    <div className={styles.unchecked}>
                      <Unchecked />
                    </div>
                  )}
                  <label htmlFor="format-csv">CSV</label>
                </div>
              </div>
            </div>
            {inputFormat === 'advanced' && (
              <>
                <div className={styles.group}>
                  <span>입력 타입</span>
                  <div className={styles.checkboxes}>
                    {inputTypes.map((type) => (
                      <div className={styles.checkbox} key={type}>
                        <input
                          id={`input-${type}`}
                          type="radio"
                          name="inputType"
                          value={type}
                          checked={inputType === type}
                          onChange={() => {
                            setInputType(type);
                            setIsJsonValid(false);
                            setError('');
                            onValidData(null, null);
                          }}
                        />
                        {inputType === type ? (
                          <div className={styles.checked}>
                            <Checked />
                          </div>
                        ) : (
                          <div className={styles.unchecked}>
                            <Unchecked />
                          </div>
                        )}
                        <label htmlFor={`input-${type}`}>{type.toUpperCase()}</label>
                      </div>
                    ))}
                  </div>
                </div>
                {inputType === 'url' && (
                  <>
                    <div className={styles.group}>
                      <label htmlFor="api-url">API URL</label>
                      <div className={styles.value}>
                        <input
                          id="api-url"
                          type="text"
                          value={apiUrl}
                          onChange={(event) => {
                            const newValue = event.target.value;
                            setApiUrl(newValue);
                            setBasicUsername('');
                            setBasicPassword('');
                            setBearerToken('');
                            setApiKeyName('');
                            setApiKeyValue('');
                            setNotionSecret('');
                            setNotionDbId('');
                            setJsonPath('');
                            setIsJsonValid(false);
                            onValidData(null, null);
                          }}
                          placeholder={apiUrlPlaceholder}
                          disabled={apiUrlDisabled}
                          required
                        />
                      </div>
                    </div>
                    <div className={styles.group}>
                      <label htmlFor="auth-type">Auth Type</label>
                      <div className={styles.value}>
                        <select
                          id="auth-type"
                          value={authType}
                          onChange={(event) => setAuthType(event.target.value as AuthType)}
                        >
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
                              onChange={(event) => setBasicUsername(event.target.value)}
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
                              onChange={(event) => setBasicPassword(event.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {authType === 'bearer' && (
                      <div className={styles.group}>
                        <label htmlFor="token">Token</label>
                        <div className={styles.value}>
                          <input
                            id="token"
                            type="text"
                            value={bearerToken}
                            onChange={(event) => setBearerToken(event.target.value)}
                          />
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
                              onChange={(event) => setApiKeyName(event.target.value)}
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
                              onChange={(event) => setApiKeyValue(event.target.value)}
                            />
                          </div>
                        </div>
                        <div className={styles.group}>
                          <label htmlFor="api-add-to">Add to</label>
                          <div className={styles.value}>
                            <select
                              id="api-add-to"
                              value={apiAddTo}
                              onChange={(event) => setApiAddTo(event.target.value as 'header' | 'query')}
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
                              onChange={(event) => setNotionSecret(event.target.value)}
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
                              onChange={(event) => setNotionDbId(event.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                {inputType === 'json' && (
                  <div className={styles.group}>
                    <label htmlFor="json-input">JSON 입력</label>
                    <div className={styles.value}>
                      <textarea
                        id="json-input"
                        rows={10}
                        value={jsonText}
                        onChange={(e) => setJsonText(e.target.value)}
                        placeholder="JSON 코드 입력"
                        required
                      />
                    </div>
                  </div>
                )}
                {inputFormat === 'advanced' && isJsonValid && (
                  <div className={styles.group}>
                    <label htmlFor="json-path">배열 경로</label>
                    <div className={styles.value}>
                      <input
                        id="json-path"
                        type="text"
                        value={jsonPath}
                        onChange={(event) => setJsonPath(event.target.value)}
                        required={!Array.isArray(jsonRaw)}
                        placeholder={Array.isArray(jsonRaw) ? '필수입력 아님' : '필수입력 항목'}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
            {inputFormat === 'tsv' && (
              <div className={styles.group}>
                <label htmlFor="tsv-text">TSV 데이터</label>
                <div className={styles.value}>
                  <textarea
                    id="tsv-text"
                    value={tsvText}
                    onChange={(event) => setTsvText(event.target.value)}
                    placeholder="엑셀/스프레드시트의 셀 복붙"
                    rows={10}
                    required
                  />
                </div>
              </div>
            )}
            {inputFormat === 'csv' && (
              <div className={styles.group}>
                <label htmlFor="csv-text">CSV 데이터</label>
                <div className={styles.value}>
                  <textarea
                    id="csv-text"
                    value={csvText}
                    onChange={(event) => setCsvText(event.target.value)}
                    placeholder="CSV 데이터 복붙"
                    rows={10}
                    required
                  />
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
