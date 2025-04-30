import styles from '@/styles/All.module.sass';

export function NotionService({
  token,
  databaseId,
  pageSize,
  onChange,
}: {
  token: string;
  databaseId: string;
  pageSize: string;
  onChange: (token: string, databaseId: string, pageSize: string) => void;
}) {
  return (
    <div className={styles.component}>
      <h3>Notion Database API</h3>
      <div className={styles.groups}>
        <div className={styles.group}>
          <label htmlFor="notion-secret-token">Secret Token</label>
          <div className={styles.value}>
            <input
              type="password"
              id="notion-secret-token"
              value={token}
              onChange={(e) => onChange(e.target.value, databaseId, pageSize)}
              required
            />
          </div>
        </div>
        <div className={styles.group}>
          <label htmlFor="notion-databaseid">Database ID</label>
          <div className={styles.value}>
            <input
              type="text"
              id="notion-databaseid"
              value={databaseId}
              onChange={(e) => onChange(token, e.target.value, pageSize)}
              required
            />
          </div>
        </div>
        <div className={styles.group}>
          <label htmlFor="notion-page-size">Page size value (최대 100)</label>
          <div className={styles.value}>
            <input
              type="text"
              id="notion-page-size"
              placeholder="Page size value (최대 100)"
              value={pageSize}
              onChange={(e) => onChange(token, databaseId, e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
