import s from './blueprint.module.css';
import { BOOKING_URL } from './util';

type Props = {
  docRef: string;
};

export function TopBar({ docRef }: Props) {
  return (
    <header className={s.top}>
      <a href="/">polynize.ai</a>
      <span>BP-{docRef}</span>
      <div className={s.topRight}>
        <a className={s.topBtn} href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
          book a call
        </a>
      </div>
    </header>
  );
}
