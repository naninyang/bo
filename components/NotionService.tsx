import styles from '@/styles/All.module.sass';

export function NotionService({
  token,
  databaseId,
  onChange,
}: {
  token: string;
  databaseId: string;
  onChange: (token: string, databaseId: string) => void;
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
              onChange={(e) => onChange(e.target.value, databaseId)}
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
              onChange={(e) => onChange(token, e.target.value)}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
}
