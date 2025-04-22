import Anchor from './Anchor';
import { useTheme } from './context/ThemeContext';
import { LogoDark, LogoLight, ModeDark, ModeLight } from './Svgs';
import styles from '@/styles/Header.module.sass';

export default function Header() {
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
        </div>
        <button type="button" onClick={toggleTheme}>
          {isDarkMode ? <ModeLight /> : <ModeDark />}
          <span>{isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}</span>
        </button>
      </div>
    </header>
  );
}
