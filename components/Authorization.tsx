import styles from '@/styles/All.module.sass';

export function Authorization({
  authType,
  onChange,
}: {
  authType: string;
  onChange: (type: string, value: any) => void;
}) {
  return (
    <div className={styles.component}>
      <h3>Authorization</h3>
      <div className={styles.cols}>
        <div className={styles.col}>
          <div className={styles.group}>
            <label htmlFor="auth-type">Auth Type</label>
            <div className={styles.value}>
              <select value={authType} onChange={(event) => onChange(event.target.value, {})}>
                <option value="none">None</option>
                <option value="basic">Basic Auth</option>
                <option value="bearer">Bearer Token</option>
              </select>
            </div>
          </div>
        </div>
        {authType === 'basic' && (
          <div className={styles.col}>
            <div className={styles.group}>
              <label htmlFor="basic-username">Username</label>
              <div className={styles.value}>
                <input
                  type="text"
                  id="basic-username"
                  placeholder="Username"
                  onChange={(event) => onChange('basic', (prev: any) => ({ ...prev, username: event.target.value }))}
                />
              </div>
            </div>
            <div className={styles.group}>
              <label htmlFor="basic-password">Password</label>
              <div className={styles.value}>
                <input
                  type="password"
                  id="basic-password"
                  placeholder="Password"
                  onChange={(event) => onChange('basic', (prev: any) => ({ ...prev, password: event.target.value }))}
                />
              </div>
            </div>
          </div>
        )}
        {authType === 'bearer' && (
          <div className={styles.col}>
            <div className={styles.group}>
              <label htmlFor="bearer-token">Token</label>
              <div className={styles.value}>
                <input
                  type="password"
                  id="bearer-token"
                  placeholder="Bearer Token"
                  onChange={(event) => onChange('bearer', event.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
