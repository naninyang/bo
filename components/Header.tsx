import { useRouter } from 'next/router';
import Anchor from './Anchor';
import { useTheme } from './context/ThemeContext';
import { LogoDark, LogoLight, ModeDark, ModeLight, Outlink } from './Svgs';
import styles from '@/styles/Header.module.sass';

export default function Header() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.container}`}>
        <div className={styles.group}>
          <h1>
            <Anchor href="/">
              {isDarkMode ? <LogoLight /> : <LogoDark />}
              <span>일트보자</span>
            </Anchor>
          </h1>
          <ol>
            <li
              className={router.asPath === `/all-about-apis` ? styles.current : ''}
              aria-current={router.asPath === `/all-about-apis` ? 'page' : false}
            >
              <Anchor href="/all-about-apis">
                <span className={styles.link}>API의 모든것</span>
              </Anchor>
            </li>
            <li>
              <Anchor href="https://a11y.dev1stud.io">
                <span className={styles.link}>안전색깔론 서비스</span>
                <Outlink />
              </Anchor>
            </li>
          </ol>
        </div>
        <button type="button" onClick={toggleTheme}>
          {isDarkMode ? <ModeLight /> : <ModeDark />}
          <span>{isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}</span>
        </button>
      </div>
    </header>
  );
}
