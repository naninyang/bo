import type { NextApiRequest, NextApiResponse } from 'next';
import { Client as NotionClient } from '@notionhq/client';
import {
  QueryDatabaseResponse,
  PageObjectResponse,
  SelectPropertyItemObjectResponse,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url, secret, databaseId } = req.query;

  if (url === 'notion') {
    if (!secret || !databaseId || typeof secret !== 'string' || typeof databaseId !== 'string') {
      return res.status(400).json({ error: 'Missing Notion secret or databaseId' });
    }

    const notion = new NotionClient({ auth: secret });

    try {
      const response: QueryDatabaseResponse = await notion.databases.query({
        database_id: databaseId,
      });

      const data = response.results
        .filter((page): page is PageObjectResponse => page.object === 'page')
        .map((page) => {
          const props = page.properties;
          const simplified: Record<string, string | number | boolean> = {};

          Object.entries(props).forEach(([key, prop]) => {
            switch (prop.type) {
              case 'title':
                simplified[key] = prop.title[0]?.plain_text ?? '';
                break;
              case 'rich_text':
                simplified[key] = prop.rich_text[0]?.plain_text ?? '';
                break;
              case 'number':
                simplified[key] = prop.number ?? '';
                break;
              case 'select':
                simplified[key] = prop.select?.name ?? '';
                break;
              case 'multi_select':
                simplified[key] = Array.isArray(prop.multi_select)
                  ? prop.multi_select
                      .map((opt) => {
                        if (typeof opt === 'object' && 'name' in opt) {
                          return opt.name;
                        }
                        return '';
                      })
                      .join(', ')
                  : '';
                break;
              case 'checkbox':
                simplified[key] = prop.checkbox;
                break;
              case 'date':
                simplified[key] = prop.date?.start ?? '';
                break;
              default:
                simplified[key] = '[Unsupported]';
            }
          });

          return simplified;
        });

      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ error: 'Notion API error', details: err });
    }
    return;
  }

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Proxy fetch error', details: err });
  }
}
