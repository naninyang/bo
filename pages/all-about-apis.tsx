import React, { ReactNode, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Seo from '@/components/Seo';
import RippleButton from '@/components/RippleButton';
import GoogleSpreadsheetService from '@/components/GoogleSpreadsheetService';
import { NotionService } from '@/components/NotionService';
import StrapiService from '@/components/StrapiService';
import { Headers } from '@/components/Headers';
import { Authorization } from '@/components/Authorization';
import Dialog from '@/components/Dialog';
import { Pagination } from '@/components/Pagination';
import styles from '@/styles/All.module.sass';
import Anchor from '@/components/Anchor';
import { LeftArrow } from '@/components/Svgs';

type AuthData =
  | ''
  | { username: string; password: string } // basic
  | string // bearer
  | { key: string; value: string }; // apikey

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type QueryParam = { key: string; value: string };

export default function AllAboutAPIs() {
  const [apiService, setApiService] = useState('custom');
  const [activeName, setActiveName] = useState<string | null>('params');
  const [apiUrl, setApiUrl] = useState('');
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);
  const [notionToken, setNotionToken] = useState('');
  const [notionDatabaseId, setNotionDatabaseId] = useState('');
  const [googleSheetId, setGoogleSheetId] = useState('');
  const [googleSheetName, setGoogleSheetName] = useState('');
  const [strapiVersion, setStrapiVersion] = useState<'v4' | 'v5'>('v4');
  const [authType, setAuthType] = useState('none');
  const [authData, setAuthData] = useState<AuthData>('');
  const [headers, setHeaders] = useState<{ key: string; value: string }[]>([]);
  const [hasHeaderDuplication, setHasHeaderDuplication] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [pageFieldName, setPageFieldName] = useState('');
  const [pageSizeFieldName, setPageSizeFieldName] = useState('');
  const [totalFieldName, setTotalFieldName] = useState('');

  const [responseData, setResponseData] = useState<JsonValue | JsonValue[] | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogContentType, setDialogContentType] = useState<'body' | 'headers' | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const handleSelectTab = (name: string) => {
    setActiveName(name);
  };

  const openDialog = (type: 'body' | 'headers') => {
    setDialogContentType(type);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogContentType(null);
    setIsDialogOpen(false);
  };

  const updateQueryParams = (params: QueryParam[]) => {
    setQueryParams(params);
    const queryString = params
      .filter((p) => p.key.trim() !== '')
      .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&');
    setApiUrl((prev) => {
      const baseUrl = prev.split('?')[0];
      return queryString ? `${baseUrl}?${queryString}` : baseUrl;
    });
  };

  const addQueryParam = () => {
    setQueryParams([...queryParams, { key: '', value: '' }]);
  };

  const removeQueryParam = (index: number) => {
    const updated = queryParams.filter((_, i) => i !== index);
    updateQueryParams(updated);
  };

  const handleApiUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setApiUrl(value);
    setSortField('');

    const queryStart = value.indexOf('?');
    if (queryStart !== -1) {
      const queryString = value.slice(queryStart + 1);
      const params: QueryParam[] = queryString
        .split('&')
        .map((param) => param.split('='))
        .filter(([key]) => key) // key가 있어야 함
        .map(([key, value = '']) => ({
          key: decodeURIComponent(key),
          value: decodeURIComponent(value),
        }));

      setQueryParams(params);
    } else {
      setQueryParams([]);
    }
  };

  const updateQueryParamField = (index: number, field: 'key' | 'value', value: string) => {
    if ((field === 'key' && value.length > 50) || (field === 'value' && value.length > 200)) return;
    const updated = [...queryParams];
    updated[index][field] = value;
    updateQueryParams(updated);
  };

  function getNestedValue(obj: unknown, path: string): unknown {
    return path.split('.').reduce((acc, key) => {
      if (acc && typeof acc === 'object' && key in acc) {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }

  function sortArray(array: JsonValue[]): void {
    if (!sortField) return;

    array.sort((a, b) => {
      const aValue = getNestedValue(a, sortField);
      const bValue = getNestedValue(b, sortField);

      if (aValue === bValue) return 0;
      if (sortOrder === 'asc') return aValue! > bValue! ? 1 : -1;
      return aValue! < bValue! ? 1 : -1;
    });
  }

  const buildFinalUrl = () => {
    const baseUrl = apiUrl.split('?')[0];
    const mergedParams = [...queryParams.filter((p) => p.key.trim() !== '')];

    if (apiService === 'strapi') {
      mergedParams.push({ key: 'pagination[page]', value: String(page) });
      mergedParams.push({ key: 'pagination[pageSize]', value: String(pageSize) });
      if (sortField) {
        mergedParams.push({ key: 'sort', value: `${sortField}:${sortOrder}` });
      }
    }

    if (apiService === 'custom') {
      if (sortField) {
        mergedParams.push({ key: 'sortField', value: sortField });
        mergedParams.push({ key: 'sortOrder', value: sortOrder });
      }
    }

    const queryString = mergedParams
      .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
      .join('&');
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  const handleSubmit = async (event?: React.FormEvent, startCursor?: string | null, isPaginationRequest?: boolean) => {
    if (event) {
      event.preventDefault();
    }
    setError('');
    setLoading(true);

    if (
      (!isPaginationRequest && (apiService === 'strapi' || apiService === 'custom' || apiService === 'google')) ||
      (!startCursor && apiService === 'notion')
    ) {
      setResponseData(null);
    }

    if (hasHeaderDuplication) {
      setError('중복된 key를 지우세요!');
      setLoading(false);
      return;
    }

    if (apiService === 'custom') {
      if (apiUrl.trim() === '') {
        setError('API URL을 입력하세요.');
        setLoading(false);
        return;
      }
      try {
        new URL(apiUrl);
      } catch {
        setError('올바른 형식의 URL이 아닙니다.');
        setLoading(false);
        return;
      }
    }

    const finalUrl = buildFinalUrl();

    try {
      const requestBody =
        apiService === 'notion'
          ? {
              url: 'notion',
              notionToken,
              notionDatabaseId,
              startCursor,
              sorts: sortField
                ? [{ property: sortField, direction: sortOrder === 'asc' ? 'ascending' : 'descending' }]
                : undefined,
            }
          : apiService === 'strapi'
            ? {
                url: finalUrl,
                method: 'GET',
                authType: 'bearer',
                authData,
                headers: [],
                strapiVersion,
              }
            : {
                url: finalUrl,
                method: 'POST',
                authType,
                authData,
                headers,
              };

      const response = await fetch('/api/proxyAdvanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(requestBody),
      });

      const responseBody = await response.json();

      if (!response.ok) {
        throw new Error(responseBody.error || `요청 실패: ${response.status}`);
      }

      if (apiService === 'notion') {
        if (Array.isArray(responseBody.results)) {
          const parsedResults = responseBody.results.map((item: { properties?: Record<string, unknown> }) => {
            const properties = item.properties ?? {};
            const parsed: { [key: string]: JsonValue } = {};

            for (const [key, value] of Object.entries(properties)) {
              parsed[key] = parseNotionProperty(value);
            }

            return parsed;
          });

          setResponseData((prev) => {
            if (Array.isArray(prev)) {
              return [...prev, ...parsedResults];
            }
            return parsedResults;
          });

          setNextCursor(responseBody.next_cursor ?? null);
        } else {
          setResponseData([]);
          setNextCursor(null);
        }
      } else if (apiService === 'custom' && typeof responseBody === 'object' && responseBody !== null) {
        if (Array.isArray(responseBody)) {
          sortArray(responseBody);
          setResponseData(responseBody);
        } else {
          const entries = Object.entries(responseBody);

          for (const [key, value] of entries) {
            if (Array.isArray(value)) {
              sortArray(value);
              setResponseData({ ...responseBody, [key]: value });
              return;
            }
          }

          setResponseData(responseBody);
        }
      } else {
        setResponseData(responseBody);
        if (apiService === 'strapi' && typeof responseBody === 'object' && responseBody !== null) {
          const meta = (responseBody.meta as { pagination?: { total?: number } }).pagination;
          if (meta) {
            setTotal(meta.total ?? null);
          }
        }
      }
    } catch (caughtError: unknown) {
      if (caughtError instanceof Response) {
        const errorBody = await caughtError.json();
        setError(errorBody.error || '요청 실패');
      } else if (caughtError instanceof Error) {
        setError(caughtError.message);
      } else {
        setError('알 수 없는 오류');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    handleSubmit(undefined, undefined, true);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
    handleSubmit(undefined, undefined, true);
  };

  function renderTable(data: JsonValue): ReactNode | string {
    if (data === null || typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
      return String(data);
    }

    if (Array.isArray(data)) {
      const isArrayOfObjects = data.every((item) => typeof item === 'object' && item !== null && !Array.isArray(item));

      if (isArrayOfObjects && data.length > 0) {
        const keys = Object.keys(data[0] as { [key: string]: JsonValue });
        return (
          <table>
            <thead>
              <tr>
                {keys.map((key) => (
                  <th key={key} scope="col">
                    <span>{key}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  {keys.map((key) => (
                    <td key={key}>
                      {typeof (item as { [key: string]: JsonValue })[key] === 'object' &&
                      (item as { [key: string]: JsonValue })[key] !== null ? (
                        renderTable((item as { [key: string]: JsonValue })[key])
                      ) : (
                        <span>{String((item as { [key: string]: JsonValue })[key])}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      }

      return (
        <>
          {data.map((item, idx) => (
            <React.Fragment key={idx}>
              {String(item)}
              {idx < data.length - 1 ? ', ' : ''}
            </React.Fragment>
          ))}
        </>
      );
    }

    const keys = Object.keys(data);

    return (
      <table>
        <thead>
          <tr>
            {keys.map((key) => (
              <th key={key} scope="col">
                <span>{key}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {keys.map((key) => (
              <td key={key}>
                {typeof (data as { [key: string]: JsonValue })[key] === 'object' &&
                (data as { [key: string]: JsonValue })[key] !== null ? (
                  renderTable((data as { [key: string]: JsonValue })[key])
                ) : (
                  <span>{String((data as { [key: string]: JsonValue })[key])}</span>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    );
  }

  function parseNotionProperty(property: unknown): JsonValue {
    if (!property || typeof property !== 'object') return '';

    const p = property as { type: string; [key: string]: unknown };

    switch (p.type) {
      case 'title':
        return Array.isArray(p.title) ? p.title.map((t: { plain_text: string }) => t.plain_text).join('') : '';
      case 'rich_text':
        return Array.isArray(p.rich_text) ? p.rich_text.map((t: { plain_text: string }) => t.plain_text).join('') : '';
      case 'multi_select':
        return Array.isArray(p.multi_select) ? p.multi_select.map((t: { name: string }) => t.name).join(', ') : '';
      case 'select':
        return typeof p.select === 'object' && p.select !== null ? (p.select as { name: string }).name : '';
      case 'date':
        return typeof p.date === 'object' && p.date !== null ? (p.date as { start: string }).start : '';
      case 'checkbox':
        return typeof p.checkbox === 'boolean' ? (p.checkbox ? 'true' : 'false') : '';
      case 'number':
        return typeof p.number === 'number' ? p.number : '';
      case 'people':
        return Array.isArray(p.people)
          ? p.people.map((person: { name?: string; id: string }) => person.name || person.id).join(', ')
          : '';
      case 'relation':
        return Array.isArray(p.relation) ? p.relation.map((r: { id: string }) => r.id).join(', ') : '';
      case 'email':
        return typeof p.email === 'string' ? p.email : '';
      case 'url':
        return typeof p.url === 'string' ? p.url : '';
      case 'phone_number':
        return typeof p.phone_number === 'string' ? p.phone_number : '';
      default:
        return '[Unsupported Type]';
    }
  }

  function renderData() {
    if (!responseData) return null;

    let dataToRender: JsonValue[] = [];

    if (
      apiService === 'notion' &&
      typeof responseData === 'object' &&
      responseData !== null &&
      'results' in responseData
    ) {
      const results = responseData.results;
      if (Array.isArray(results)) {
        dataToRender = results.map((item) => {
          if (typeof item === 'object' && item !== null && 'properties' in item) {
            const properties = (item.properties as Record<string, unknown>) ?? {};

            const parsed: { [key: string]: JsonValue } = {};

            for (const [key, value] of Object.entries(properties)) {
              parsed[key] = parseNotionProperty(value);
            }

            return parsed;
          }
          return {};
        });
      }
    } else {
      dataToRender = Array.isArray(responseData) ? responseData : [responseData];
    }

    return (
      <>
        {dataToRender.map((item, idx) => (
          <React.Fragment key={idx}>{renderTable(item)}</React.Fragment>
        ))}
      </>
    );
  }

  const timestamp = Date.now();

  return (
    <main className={styles.main}>
      <Seo
        pageDescription="하나의 JSON으로 테이블과 차트를 볼 수 있어요!"
        pageImg={`https://bo.dev1stud.io/images/og.webp?ts=${timestamp}`}
      />
      <div className={styles.container}>
        <div className={styles.backlink}>
          <Anchor href="/">
            <LeftArrow />
            <span>뒤로가기</span>
          </Anchor>
        </div>
        <h1>
          <span>API의 모든것</span> <em>All About APIs</em>
        </h1>
        <ul className={styles.announcement}>
          <li>
            JSON 속성명(field name) 및 속성값(field value)은 <strong>Raw Text 형태</strong>로 표시됩니다.
          </li>
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
        <div className={styles.form}>
          <section className={styles.section}>
            <div className={styles.module}>
              <h2>엔드포인트 정보</h2>
              <form onSubmit={(event) => handleSubmit(event, undefined, false)}>
                <fieldset>
                  <legend>엔드포인트 정보 입력폼</legend>
                  <div className={styles.group}>
                    <label htmlFor="api-services">API Services</label>
                    <div className={styles.value}>
                      <select
                        id="api-services"
                        value={apiService}
                        onChange={(e) => {
                          setApiService(e.target.value);
                          setResponseData(null);
                        }}
                      >
                        <option value="custom">API 서비스 선택 안함</option>
                        <option value="notion">Notion Database API</option>
                        <option value="google">Google Spreadsheet</option>
                        <option value="strapi">Strapi CMS API</option>
                      </select>
                    </div>
                  </div>
                  {apiService !== 'custom' && <hr />}
                  {apiService === 'notion' && (
                    <NotionService
                      token={notionToken}
                      databaseId={notionDatabaseId}
                      onChange={(token, id) => {
                        setNotionToken(token);
                        setNotionDatabaseId(id);
                      }}
                    />
                  )}
                  {apiService === 'google' && (
                    <GoogleSpreadsheetService
                      sheetId={googleSheetId}
                      sheetName={googleSheetName}
                      onChange={(url, id, name) => {
                        setApiUrl(url);
                        setGoogleSheetId(id);
                        setGoogleSheetName(name);
                      }}
                    />
                  )}
                  {apiService === 'strapi' && (
                    <StrapiService
                      onChange={(url, token, version) => {
                        setApiUrl(url);
                        setAuthType('bearer');
                        setAuthData(token);
                        setStrapiVersion(version);
                      }}
                    />
                  )}
                  {apiService !== 'custom' && (
                    <div className={styles.group}>
                      <label htmlFor="sorting-option">정렬 옵션</label>
                      <div className={styles.value}>
                        <input
                          type="text"
                          placeholder="정렬 기준 필드 (필수 아님)"
                          value={sortField}
                          onChange={(e) => setSortField(e.target.value)}
                        />
                      </div>
                      <div className={styles.value}>
                        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}>
                          <option value="asc">오름차순 (asc)</option>
                          <option value="desc">내림차순 (desc)</option>
                        </select>
                      </div>
                    </div>
                  )}
                  {apiService === 'custom' && (
                    <div className={styles['collapse-button']}>
                      <ul>
                        <li>
                          <button
                            type="button"
                            role="tab"
                            className={activeName === 'params' ? styles.current : undefined}
                            aria-controls="content-params"
                            id="button-params"
                            onClick={() => handleSelectTab('params')}
                          >
                            Params
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            role="tab"
                            className={activeName === 'authorization' ? styles.current : undefined}
                            aria-controls="content-authorization"
                            id="button-authorization"
                            onClick={() => handleSelectTab('authorization')}
                          >
                            Authorization
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            role="tab"
                            className={activeName === 'headers' ? styles.current : undefined}
                            aria-controls="content-headers"
                            id="button-headers"
                            onClick={() => handleSelectTab('headers')}
                          >
                            Headers
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                  {apiService === 'custom' && (
                    <div className={styles['collapse-contents']}>
                      <div
                        id="content-params"
                        role="tabpanel"
                        aria-labelledby="button-params"
                        aria-hidden={activeName === 'params' ? 'false' : 'true'}
                        className={`${styles.content} ${activeName === 'params' ? styles.show : ''}`}
                      >
                        <div className={styles.group}>
                          <label htmlFor="api-url">API URL</label>
                          <div className={styles.value}>
                            <input
                              type="text"
                              id="api-url"
                              value={apiUrl}
                              onChange={handleApiUrlChange}
                              placeholder="API URL 입력"
                              required
                            />
                          </div>
                        </div>
                        <div className={styles.component}>
                          <h3>Query Params</h3>
                          <div className={styles.list}>
                            <div className={styles.term} aria-hidden>
                              <span>Key</span>
                              <span>Value</span>
                            </div>
                            <div className={styles.desc}>
                              {queryParams.map((param, index) => (
                                <div key={index}>
                                  <div className={styles.value}>
                                    <input
                                      type="text"
                                      placeholder="Key"
                                      value={param.key}
                                      onChange={(e) => updateQueryParamField(index, 'key', e.target.value)}
                                    />
                                  </div>
                                  <div className={styles.value}>
                                    <input
                                      type="text"
                                      placeholder="Value"
                                      value={param.value}
                                      onChange={(e) => updateQueryParamField(index, 'value', e.target.value)}
                                    />
                                  </div>
                                  <div className={styles.remove}>
                                    <RippleButton type="button" onClick={() => removeQueryParam(index)}>
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
                              <button type="button" onClick={addQueryParam}>
                                <span>Param 추가</span>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className={styles.group}>
                          <label htmlFor="sorting-option">정렬 옵션</label>
                          <div className={styles.value}>
                            <input
                              type="text"
                              placeholder="정렬 기준 필드"
                              value={sortField}
                              onChange={(e) => setSortField(e.target.value)}
                            />
                          </div>
                          <div className={styles.value}>
                            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}>
                              <option value="asc">오름차순 (asc)</option>
                              <option value="desc">내림차순 (desc)</option>
                            </select>
                          </div>
                        </div>
                        <div className={styles.group}>
                          <label htmlFor="page-field-name">페이지 옵션</label>
                          <div className={styles.value}>
                            <input
                              type="text"
                              id="page-field-name"
                              placeholder="page number field"
                              value={pageFieldName}
                              onChange={(e) => setPageFieldName(e.target.value)}
                            />
                          </div>
                          <div className={styles.value}>
                            <input
                              type="text"
                              id="page-size-field-name"
                              placeholder="page size field"
                              value={pageSizeFieldName}
                              onChange={(e) => setPageSizeFieldName(e.target.value)}
                            />
                          </div>
                          <div className={styles.value}>
                            <input
                              type="text"
                              id="total-field-name"
                              placeholder="total field"
                              value={totalFieldName}
                              onChange={(e) => setTotalFieldName(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div
                        id="content-authorization"
                        role="tabpanel"
                        aria-labelledby="button-authorization"
                        aria-hidden={activeName === 'authorization' ? 'false' : 'true'}
                        className={`${styles.content} ${activeName === 'authorization' ? styles.show : ''}`}
                      >
                        <Authorization
                          authType={authType}
                          onChange={(type, value) => {
                            setAuthType(type);
                            setAuthData(value);
                          }}
                        />
                      </div>
                      <div
                        id="content-headers"
                        role="tabpanel"
                        aria-labelledby="button-headers"
                        aria-hidden={activeName === 'headers' ? 'false' : 'true'}
                        className={`${styles.content} ${activeName === 'headers' ? styles.show : ''}`}
                      >
                        <Headers headers={headers} onChange={setHeaders} onDuplicate={setHasHeaderDuplication} />
                      </div>
                    </div>
                  )}
                  <div className={styles.submit}>
                    <RippleButton type="submit">
                      <span>API 보기</span>
                    </RippleButton>
                  </div>
                </fieldset>
              </form>
            </div>
          </section>
          {(loading || error || responseData) && (
            <section className={styles.section}>
              <div className={styles.module}>
                {responseData ? (
                  <div className={styles.headline}>
                    <h2>데이터 보기</h2>
                    <ul>
                      <li>
                        <button type="button" onClick={() => openDialog('body')}>
                          Body (JSON) 보기
                        </button>
                      </li>
                      <li>
                        <button type="button" onClick={() => openDialog('headers')}>
                          Headers 보기
                        </button>
                      </li>
                    </ul>
                  </div>
                ) : (
                  <h2>데이터 보기</h2>
                )}
                {(loading || error || responseData) && (
                  <div className={styles.result}>
                    {responseData && (
                      <>
                        <div
                          className={`${styles.table} ${loading ? styles['table-loading'] : ''} ${apiService === 'notion' && loading ? styles['notion-loading'] : ''}`}
                        >
                          {renderData()}
                        </div>
                        {(apiService === 'strapi' || apiService === 'custom') && (
                          <Pagination
                            page={page}
                            pageSize={pageSize}
                            total={total}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                          />
                        )}
                        {apiService === 'notion' && nextCursor && (
                          <button type="button" onClick={() => handleSubmit(undefined, nextCursor)}>
                            <span>더보기</span>
                          </button>
                        )}
                      </>
                    )}
                    {loading && <p className={styles.loading}>로딩 중...</p>}
                    {error && <p className={styles.error}>{error}</p>}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
      {isDialogOpen && (
        <Dialog isOpen={isDialogOpen} onClose={closeDialog}>
          {dialogContentType === 'body' && responseData && (
            <>
              <div className={styles['modal-headline']}>
                <h1>Body (JSON)</h1>
                <button type="button" onClick={closeDialog}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M5.99032 4.99018C5.79139 4.99023 5.59699 5.04961 5.43198 5.16073C5.26697 5.27184 5.13884 5.42964 5.06399 5.61395C4.98913 5.79826 4.97094 6.00071 5.01175 6.19542C5.05255 6.39012 5.15049 6.56823 5.29305 6.70698L10.586 11.9999L5.29305 17.2929C5.19708 17.3851 5.12046 17.4954 5.06767 17.6176C5.01489 17.7397 4.987 17.8711 4.98565 18.0042C4.98429 18.1372 5.0095 18.2692 5.05979 18.3924C5.11008 18.5155 5.18444 18.6274 5.27852 18.7215C5.3726 18.8156 5.4845 18.89 5.60768 18.9402C5.73086 18.9905 5.86283 19.0157 5.99587 19.0144C6.12891 19.013 6.26034 18.9851 6.38247 18.9324C6.5046 18.8796 6.61497 18.803 6.70712 18.707L12.0001 13.414L17.2931 18.707C17.3852 18.803 17.4956 18.8796 17.6177 18.9324C17.7398 18.9851 17.8713 19.013 18.0043 19.0144C18.1373 19.0157 18.2693 18.9905 18.3925 18.9402C18.5157 18.89 18.6276 18.8156 18.7217 18.7215C18.8157 18.6274 18.8901 18.5155 18.9404 18.3924C18.9907 18.2692 19.0159 18.1372 19.0145 18.0042C19.0132 17.8711 18.9853 17.7397 18.9325 17.6176C18.8797 17.4954 18.8031 17.3851 18.7071 17.2929L13.4141 11.9999L18.7071 6.70698C18.8516 6.56652 18.9503 6.38567 18.9903 6.18815C19.0302 5.99063 19.0096 5.78565 18.931 5.60007C18.8525 5.41448 18.7197 5.25695 18.5501 5.14812C18.3805 5.03929 18.182 4.98424 17.9806 4.99018C17.7208 4.99792 17.4742 5.1065 17.2931 5.29292L12.0001 10.5859L6.70712 5.29292C6.61393 5.19712 6.50248 5.12098 6.37937 5.06898C6.25625 5.01698 6.12396 4.99019 5.99032 4.99018Z"
                      fill="white"
                    />
                  </svg>
                  <span>닫기</span>
                </button>
              </div>
              <div className={styles['modal-content']}>
                <div className={styles['syntax-highligher']}>
                  <SyntaxHighlighter language="json" style={a11yDark} showLineNumbers wrapLongLines>
                    {JSON.stringify(responseData, null, 2)}
                  </SyntaxHighlighter>
                </div>
              </div>
            </>
          )}
          {dialogContentType === 'headers' && (
            <>
              <div className={styles['modal-headline']}>
                <h1>Headers</h1>
                <button type="button" onClick={closeDialog}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M5.99032 4.99018C5.79139 4.99023 5.59699 5.04961 5.43198 5.16073C5.26697 5.27184 5.13884 5.42964 5.06399 5.61395C4.98913 5.79826 4.97094 6.00071 5.01175 6.19542C5.05255 6.39012 5.15049 6.56823 5.29305 6.70698L10.586 11.9999L5.29305 17.2929C5.19708 17.3851 5.12046 17.4954 5.06767 17.6176C5.01489 17.7397 4.987 17.8711 4.98565 18.0042C4.98429 18.1372 5.0095 18.2692 5.05979 18.3924C5.11008 18.5155 5.18444 18.6274 5.27852 18.7215C5.3726 18.8156 5.4845 18.89 5.60768 18.9402C5.73086 18.9905 5.86283 19.0157 5.99587 19.0144C6.12891 19.013 6.26034 18.9851 6.38247 18.9324C6.5046 18.8796 6.61497 18.803 6.70712 18.707L12.0001 13.414L17.2931 18.707C17.3852 18.803 17.4956 18.8796 17.6177 18.9324C17.7398 18.9851 17.8713 19.013 18.0043 19.0144C18.1373 19.0157 18.2693 18.9905 18.3925 18.9402C18.5157 18.89 18.6276 18.8156 18.7217 18.7215C18.8157 18.6274 18.8901 18.5155 18.9404 18.3924C18.9907 18.2692 19.0159 18.1372 19.0145 18.0042C19.0132 17.8711 18.9853 17.7397 18.9325 17.6176C18.8797 17.4954 18.8031 17.3851 18.7071 17.2929L13.4141 11.9999L18.7071 6.70698C18.8516 6.56652 18.9503 6.38567 18.9903 6.18815C19.0302 5.99063 19.0096 5.78565 18.931 5.60007C18.8525 5.41448 18.7197 5.25695 18.5501 5.14812C18.3805 5.03929 18.182 4.98424 17.9806 4.99018C17.7208 4.99792 17.4742 5.1065 17.2931 5.29292L12.0001 10.5859L6.70712 5.29292C6.61393 5.19712 6.50248 5.12098 6.37937 5.06898C6.25625 5.01698 6.12396 4.99019 5.99032 4.99018Z"
                      fill="white"
                    />
                  </svg>
                  <span>닫기</span>
                </button>
              </div>
              <div className={styles['modal-content']}>
                <div className={styles.table}>
                  <table>
                    <thead>
                      <tr>
                        <th scope="col">Key</th>
                        <th scope="col">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        'server',
                        'date',
                        'content-type',
                        'content-length',
                        'connection',
                        'content-security-policy',
                        'referrer-policy',
                        'strict-transport-security',
                        'x-content-type-options',
                        'x-dns-prefetch-control',
                        'x-download-options',
                        'x-frame-options',
                        'x-permitted-cross-domain-policies',
                        'vary',
                        'access-control-allow-credentials',
                        'x-powered-by',
                      ].map((key) =>
                        responseHeaders[key] ? (
                          <tr key={key}>
                            <td>{key}</td>
                            <td>{responseHeaders[key]}</td>
                          </tr>
                        ) : null,
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </Dialog>
      )}
    </main>
  );
}
