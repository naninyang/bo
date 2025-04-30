import styles from '@/styles/All.module.sass';
import { AuthData, AuthType } from '@/types';
import { useState } from 'react';

export type AuthorizationProps = {
  authType: AuthType;
  onChange: (type: AuthType, value: AuthData | ((prev: AuthData) => AuthData)) => void;
};

export function Authorization({ authType, onChange }: AuthorizationProps) {
  const [isHidden, setIsHidden] = useState(false);
  return (
    <div className={styles.component}>
      <h3>Authorization</h3>
      <div className={styles.cols}>
        <div className={styles.col}>
          <div className={styles.group}>
            <label htmlFor="auth-type">Auth Type</label>
            <div className={styles.value}>
              <select
                id="auth-type"
                value={authType}
                onChange={(event) => onChange(event.target.value as AuthType, '')}
              >
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
                  onChange={(event) =>
                    onChange('basic', (prev) => {
                      const prevObj = typeof prev === 'object' && prev !== null ? prev : { username: '', password: '' };
                      return {
                        username: event.target.value,
                        password: 'password' in prevObj ? prevObj.password : '',
                      };
                    })
                  }
                />
              </div>
            </div>
            <div className={styles.group}>
              <label htmlFor="basic-password">Password</label>
              <div className={styles.value}>
                <input
                  type={isHidden ? 'password' : 'text'}
                  id="basic-password"
                  placeholder="Password"
                  autoComplete="off"
                  onChange={(event) =>
                    onChange('basic', (prev) => {
                      const prevObj = typeof prev === 'object' && prev !== null ? prev : { username: '', password: '' };
                      return {
                        username: 'username' in prevObj ? prevObj.username : '',
                        password: event.target.value,
                      };
                    })
                  }
                />
              </div>
              <button type="button" onClick={() => setIsHidden(!isHidden)} className={isHidden ? styles.isHidden : ''}>
                {isHidden ? '보기' : '숨기기'}
              </button>
            </div>
          </div>
        )}

        {authType === 'bearer' && (
          <div className={styles.col}>
            <div className={styles.group}>
              <label htmlFor="bearer-token">Token</label>
              <div className={styles.value}>
                <input
                  type="text"
                  inputMode={isHidden ? 'text' : undefined}
                  id="bearer-token"
                  placeholder="Bearer Token"
                  onChange={(event) => onChange('bearer', event.target.value)}
                  autoComplete={isHidden ? 'on' : 'off'}
                />
              </div>
              <button type="button" onClick={() => setIsHidden(!isHidden)} className={isHidden ? styles.isHidden : ''}>
                {isHidden ? '보기' : '숨기기'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
