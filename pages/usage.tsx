import { useTheme } from '@/components/context/ThemeContext';
import { LogoUsageDark, LogoUsageLight } from '@/components/Svgs';
import styles from '@/styles/Usage.module.sass';

export default function Usage() {
  const { isDarkMode } = useTheme();
  return (
    <main className={styles.usage}>
      <div className={`container ${styles.container}`}>
        <div className={styles.svg}>{isDarkMode ? <LogoUsageDark /> : <LogoUsageLight />}</div>
        <div className={styles.notice}>
          <p>본 웹서비스는 쿠키를 수집하지 않습니다.</p>
          <p>비즈니스 이메일: 1157iamari@gmail.com</p>
        </div>
        <div className={styles.staff}>
          <dl>
            <div>
              <dt>Hosting</dt>
              <dd>VERCEL (버셀)</dd>
            </div>
            <div>
              <dt>UX/UI</dt>
              <dd>Chloe Ariko (고아리)</dd>
            </div>
            <div>
              <dt>Development</dt>
              <dd>Chloe Ariko (고아리)</dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  );
}
