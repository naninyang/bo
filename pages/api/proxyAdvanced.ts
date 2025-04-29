import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@notionhq/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '허용되지 않은 메서드입니다.' });
  }

  const { url, method, authType, authData, headers = [], notionToken, notionDatabaseId, startCursor, sorts } = req.body;

  try {
    if (url === 'notion') {
      if (!notionToken || !notionDatabaseId) {
        return res.status(400).json({ error: 'Notion token과 database ID가 필요합니다.' });
      }
      const notion = new Client({ auth: notionToken });
      const notionQueryOptions: any = { database_id: notionDatabaseId };

      if (startCursor) {
        notionQueryOptions.start_cursor = startCursor;
      }

      if (sorts) {
        notionQueryOptions.sorts = sorts;
      }

      const response = await notion.databases.query(notionQueryOptions);
      return res.status(200).json(response);
    }

    if (url.includes('/api/') && authType === 'bearer' && typeof authData === 'string') {
      const requestHeaders: Record<string, string> = {
        Authorization: `Bearer ${authData}`,
      };

      const response = await fetch(url, {
        method: 'GET',
        headers: requestHeaders,
      });

      const contentType = response.headers.get('content-type');
      const data = contentType?.includes('application/json') ? await response.json() : null;

      if (!response.ok) {
        if (data?.error?.status === 404) {
          return res.status(404).json({
            error:
              '입력하신 Collection Name이 잘못되었습니다. 단수형이 아닌 복수형으로 입력한 것은 아닌지, 오타는 없는지 확인하세요.',
          });
        }
        if (data?.error?.status === 401) {
          return res.status(401).json({ error: '입력하신 Bearer Token이 잘못되었습니다.' });
        }
        return res.status(response.status).json({ error: data?.error?.message ?? '요청 실패' });
      }

      if (contentType?.includes('application/json')) {
        return res.status(200).json(data);
      } else {
        const text = await response.text();
        return res.status(200).json({ raw: text });
      }
    }

    const requestHeaders: Record<string, string> = {};

    if (authType === 'basic' && authData.username && authData.password) {
      requestHeaders['Authorization'] =
        `Basic ${Buffer.from(`${authData.username}:${authData.password}`).toString('base64')}`;
    } else if (authType === 'bearer' && typeof authData === 'string') {
      requestHeaders['Authorization'] = `Bearer ${authData}`;
    } else if (authType === 'apikey' && authData.key && authData.value) {
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
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return res.status(200).json(data);
    } else {
      const text = await response.text();
      return res.status(200).json({ raw: text });
    }
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}
