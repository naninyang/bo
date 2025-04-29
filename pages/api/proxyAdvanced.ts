import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@notionhq/client';

type AuthDataType =
  | { username: string; password: string } // basic
  | string // bearer
  | { key: string; value: string }; // apikey
type HeaderItem = { key: string; value: string };
type NotionSort = { property: string; direction: 'ascending' | 'descending' };

interface ProxyRequestBody {
  url: string;
  method?: 'GET' | 'POST';
  authType?: 'none' | 'basic' | 'bearer' | 'apikey';
  authData?: AuthDataType;
  headers?: HeaderItem[];
  notionToken?: string;
  notionDatabaseId?: string;
  startCursor?: string;
  sorts?: NotionSort[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '허용되지 않은 메서드입니다.' });
  }

  const {
    url,
    authType,
    authData,
    headers = [],
    notionToken,
    notionDatabaseId,
    startCursor,
    sorts,
  }: ProxyRequestBody = req.body;

  try {
    if (url === 'notion') {
      if (!notionToken || !notionDatabaseId) {
        return res.status(400).json({ error: 'Notion token과 database ID가 필요합니다.' });
      }
      const notion = new Client({ auth: notionToken });
      const notionQueryOptions: {
        database_id: string;
        start_cursor?: string;
        sorts?: NotionSort[];
      } = { database_id: notionDatabaseId };

      if (startCursor) {
        notionQueryOptions.start_cursor = startCursor;
      }

      if (sorts) {
        notionQueryOptions.sorts = sorts;
      }

      const response = await notion.databases.query(notionQueryOptions);
      return res.status(200).json(response);
    }

    const requestHeaders: Record<string, string> = {};

    if (authType === 'basic' && typeof authData === 'object' && 'username' in authData && 'password' in authData) {
      requestHeaders['Authorization'] =
        `Basic ${Buffer.from(`${authData.username}:${authData.password}`).toString('base64')}`;
    } else if (authType === 'bearer' && typeof authData === 'string') {
      requestHeaders['Authorization'] = `Bearer ${authData}`;
    } else if (authType === 'apikey' && typeof authData === 'object' && 'key' in authData && 'value' in authData) {
      requestHeaders[authData.key] = authData.value;
    }

    for (const { key, value } of headers) {
      if (key.trim() !== '') {
        requestHeaders[key] = value;
      }
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: requestHeaders,
    });

    const contentType = response.headers.get('content-type');
    const headersToExpose: string[] = [];

    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey !== 'content-encoding' && lowerKey !== 'content-length') {
        res.setHeader(key, value);
        headersToExpose.push(key);
      }
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', headersToExpose.join(', '));

    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      const text = await response.text();
      return res.status(response.status).send(text);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return res.status(500).json({ error: errorMessage });
  }
}
