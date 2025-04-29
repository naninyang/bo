import { useEffect } from 'react';
import styles from '@/styles/All.module.sass';

type Props = {
  sheetId: string;
  sheetName: string;
  onChange: (url: string, sheetId: string, sheetName: string) => void;
};

export default function GoogleSpreadsheetService({ sheetId, sheetName, onChange }: Props) {
  const handleSheetIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(`https://opensheet.vercel.app/${event.target.value}/${sheetName}`, event.target.value, sheetName);
  };

  const handleSheetNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(`https://opensheet.vercel.app/${sheetId}/${event.target.value}`, sheetId, event.target.value);
  };

  useEffect(() => {
    if (sheetId) {
      const url = `https://opensheet.vercel.app/${sheetId}/${sheetName}`;
      onChange(url, sheetId, sheetName);
    }
  }, [sheetId, sheetName, onChange]);

  return (
    <div className={styles.component}>
      <h3>Google Spreadsheet</h3>
      <div className={styles.groups}>
        <div className={styles.group}>
          <label htmlFor="sheet-id">Sheet ID</label>
          <div className={styles.value}>
            <input type="text" id="sheet-id" value={sheetId} onChange={handleSheetIdChange} />
          </div>
        </div>
        <div className={styles.group}>
          <label htmlFor="sheet-name">Sheet Name</label>
          <div className={styles.value}>
            <input type="text" id="sheet-name" value={sheetName} onChange={handleSheetNameChange} />
          </div>
        </div>
      </div>
    </div>
  );
}
